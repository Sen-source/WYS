package com.piamonte.biz.service.impl;

import com.piamonte.biz.OrderService;
import com.piamonte.biz.data.*;
import com.piamonte.biz.CheckoutRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public Order createOrder(Long userId, CheckoutRequest request) {
        try {
            System.out.println("=== ORDER CREATION STARTED ===");
            System.out.println("Creating order for user ID: " + userId);
            System.out.println("CheckoutRequest: " + request);
        
        // Test database connection
        System.out.println("Testing database connection...");
        long userCount = userRepository.count();
        System.out.println("Database connection OK. Total users: " + userCount);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        System.out.println("User found: " + user.getEmail());
        
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> {
                System.out.println("Creating new cart for user ID: " + userId);
                Cart newCart = new Cart(user);
                return cartRepository.save(newCart);
            });
        
        System.out.println("Cart found with ID: " + cart.getId());
        
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        System.out.println("Cart items count: " + cartItems.size());
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty for user ID: " + userId + ". Please add items to cart before checkout.");
        }
        
        // Log cart items for debugging
        for (CartItem item : cartItems) {
            System.out.println("Cart item: " + item.getProduct().getName() + " x" + item.getQuantity() + " = ₱" + item.getTotalPrice());
        }
        
        // Validate cart items
        for (CartItem item : cartItems) {
            if (item.getProduct() == null) {
                throw new RuntimeException("Cart item has null product");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Cart item has invalid quantity: " + item.getQuantity());
            }
            if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Cart item has invalid unit price: " + item.getUnitPrice());
            }
        }
        
        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        
        // Calculate totals
        BigDecimal subtotal = cartItems.stream()
            .map(CartItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.08")); // 8% tax
        BigDecimal shippingCost = new BigDecimal("10.00"); // Fixed shipping cost
        BigDecimal total = subtotal.add(tax).add(shippingCost);
        
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setShippingCost(shippingCost);
        order.setTotal(total);
        
        // Set addresses
        System.out.println("Setting shipping address: " + request.getShippingAddress());
        System.out.println("Setting billing address: " + request.getBillingAddress());
        
        try {
            Order.ShippingAddress shippingAddress = new Order.ShippingAddress(
                request.getShippingAddress().getStreet(),
                request.getShippingAddress().getCity(),
                request.getShippingAddress().getState(),
                request.getShippingAddress().getZipCode(),
                request.getShippingAddress().getCountry()
            );
            order.setShippingAddress(shippingAddress);
            System.out.println("Shipping address set successfully");
            
            Order.BillingAddress billingAddress = new Order.BillingAddress(
                request.getBillingAddress().getStreet(),
                request.getBillingAddress().getCity(),
                request.getBillingAddress().getState(),
                request.getBillingAddress().getZipCode(),
                request.getBillingAddress().getCountry()
            );
            order.setBillingAddress(billingAddress);
            System.out.println("Billing address set successfully");
        } catch (Exception e) {
            System.err.println("Error setting addresses: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to set addresses: " + e.getMessage(), e);
        }
        
        order.setNotes(request.getNotes());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        
        System.out.println("Saving order to database...");
        Order savedOrder;
        try {
            savedOrder = orderRepository.save(order);
            System.out.println("Order saved with ID: " + savedOrder.getId());
        } catch (Exception e) {
            System.err.println("Error saving order to database: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save order: " + e.getMessage(), e);
        }
        
        // Create order items
        System.out.println("Creating order items...");
        for (CartItem cartItem : cartItems) {
            try {
                System.out.println("Creating order item for product: " + cartItem.getProduct().getName());
                System.out.println("Order ID: " + savedOrder.getId());
                System.out.println("Product ID: " + cartItem.getProduct().getId());
                System.out.println("Quantity: " + cartItem.getQuantity());
                System.out.println("Unit Price: " + cartItem.getUnitPrice());
                
                OrderItem orderItem = new OrderItem(savedOrder, cartItem.getProduct(), 
                    cartItem.getQuantity(), cartItem.getUnitPrice());
                
                System.out.println("OrderItem created, saving to database...");
                orderItemRepository.save(orderItem);
                System.out.println("Order item saved successfully");
            } catch (Exception e) {
                System.err.println("Error creating order item for product: " + cartItem.getProduct().getName());
                System.err.println("Error details: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to create order item: " + e.getMessage(), e);
            }
        }
        
        // Clear cart
        System.out.println("Clearing cart...");
        cartItemRepository.deleteByCartId(cart.getId());
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
        System.out.println("Cart cleared successfully");
        
        System.out.println("Order creation completed successfully");
        return savedOrder;
        
        } catch (Exception e) {
            System.err.println("Error in createOrder: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Order processOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check stock availability
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem item : orderItems) {
            if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + item.getProduct().getName());
            }
        }
        
        // Reserve stock
        for (OrderItem item : orderItems) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }
        
        order.setStatus(Order.OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }
    
    @Override
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(status);
        
        if (status == Order.OrderStatus.SHIPPED) {
            order.setShippedDate(LocalDateTime.now());
        } else if (status == Order.OrderStatus.DELIVERED) {
            order.setDeliveredDate(LocalDateTime.now());
        }
        
        return orderRepository.save(order);
    }
    
    @Override
    public Order updatePaymentStatus(Long orderId, Order.PaymentStatus status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setPaymentStatus(status);
        return orderRepository.save(order);
    }
    
    @Override
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }
    
    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    @Override
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    @Override
    public Optional<Order> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }
    
    @Override
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel delivered order");
        }
        
        // Restore stock
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem item : orderItems) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
    
    @Override
    public void deleteOrder(Long orderId) {
        try {
            System.out.println("=== ORDER SERVICE DELETE START ===");
            System.out.println("DELETE: Starting deletion for order ID: " + orderId);
            
            if (orderId == null) {
                throw new IllegalArgumentException("Order ID cannot be null");
            }
            
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (!orderOpt.isPresent()) {
                throw new RuntimeException("Order with ID " + orderId + " not found");
            }
            
            Order order = orderOpt.get();
            System.out.println("Found order to delete: " + order.getOrderNumber());
            
            // Delete the order (order items will be deleted due to cascade)
            orderRepository.deleteById(orderId);
            System.out.println("DELETE: Order " + orderId + " deleted successfully");
            System.out.println("=== ORDER SERVICE DELETE SUCCESS ===");
            
        } catch (Exception e) {
            System.out.println("=== ORDER SERVICE DELETE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            throw e;
        }
    }
    
    private String generateOrderNumber() {
        return "WYS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}



