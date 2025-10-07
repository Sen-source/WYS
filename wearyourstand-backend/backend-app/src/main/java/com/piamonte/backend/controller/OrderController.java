package com.piamonte.backend.controller;

import com.piamonte.biz.AddressDto;
import com.piamonte.biz.CheckoutRequest;
import com.piamonte.biz.OrderDto;
import com.piamonte.biz.OrderItemDto;
import com.piamonte.biz.OrderService;
import com.piamonte.biz.data.Order;
import com.piamonte.biz.data.OrderItem;
import com.piamonte.biz.data.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest request) {
        try {
            System.out.println("Checkout request received: " + request);
            Long userId = getCurrentUserId();
            System.out.println("Current user ID: " + userId);
            
            // Validate request
            if (request.getShippingAddress() == null || request.getBillingAddress() == null) {
                return ResponseEntity.badRequest().body("Shipping and billing addresses are required");
            }
            
            Order order = orderService.createOrder(userId, request);
            System.out.println("Order created successfully: " + order.getOrderNumber());
            
            // Return order details as JSON
            OrderDto orderDto = convertToDto(order);
            return ResponseEntity.ok(orderDto);
        } catch (RuntimeException e) {
            System.err.println("Checkout failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Checkout failed: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during checkout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<OrderDto>> getUserOrders() {
        Long userId = getCurrentUserId();
        List<Order> orders = orderService.getUserOrders(userId);
        List<OrderDto> orderDtos = orders.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(orderDtos);
    }
    
    @GetMapping("/admin")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        List<OrderDto> orderDtos = orders.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(orderDtos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        Optional<Order> orderOpt = orderService.getOrderById(id);
        if (orderOpt.isPresent()) {
            return ResponseEntity.ok(convertToDto(orderOpt.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDto> getOrderByNumber(@PathVariable String orderNumber) {
        Optional<Order> orderOpt = orderService.getOrderByNumber(orderNumber);
        if (orderOpt.isPresent()) {
            return ResponseEntity.ok(convertToDto(orderOpt.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            System.out.println("=== CANCEL ORDER REQUEST ===");
            System.out.println("Order ID to cancel: " + id);
            System.out.println("Current user ID: " + getCurrentUserId());
            
            // First check if the order exists and belongs to the current user
            Optional<Order> orderOpt = orderService.getOrderById(id);
            if (!orderOpt.isPresent()) {
                System.out.println("Order not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            System.out.println("Found order: " + order.getOrderNumber() + " for user: " + order.getUser().getId());
            
            // Check if the order belongs to the current user
            Long currentUserId = getCurrentUserId();
            if (!order.getUser().getId().equals(currentUserId)) {
                System.out.println("Order does not belong to current user. Order user: " + order.getUser().getId() + ", Current user: " + currentUserId);
                return ResponseEntity.status(403).body("You can only cancel your own orders");
            }
            
            // Check if order can be cancelled
            if (order.getStatus() == Order.OrderStatus.DELIVERED) {
                System.out.println("Cannot cancel delivered order: " + order.getOrderNumber());
                return ResponseEntity.badRequest().body("Cannot cancel delivered order");
            }
            
            if (order.getStatus() == Order.OrderStatus.CANCELLED) {
                System.out.println("Order already cancelled: " + order.getOrderNumber());
                return ResponseEntity.badRequest().body("Order is already cancelled");
            }
            
            System.out.println("Proceeding to cancel order: " + order.getOrderNumber());
            orderService.cancelOrder(id);
            System.out.println("Order cancelled successfully: " + order.getOrderNumber());
            
            return ResponseEntity.ok("Order cancelled successfully");
        } catch (Exception e) {
            System.err.println("Error cancelling order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to cancel order: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatusUpdate statusUpdate) {
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusUpdate.getStatus());
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(convertToDto(updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return ((User) authentication.getPrincipal()).getId();
        }
        throw new RuntimeException("User not authenticated");
    }
    
    private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setShippingCost(order.getShippingCost());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setOrderDate(order.getOrderDate());
        
        // Convert order items
        if (order.getOrderItems() != null) {
            List<OrderItemDto> orderItemDtos = order.getOrderItems().stream()
                .map(this::convertOrderItemToDto)
                .collect(Collectors.toList());
            dto.setOrderItems(orderItemDtos);
        }
        
        if (order.getShippingAddress() != null) {
            AddressDto shippingAddress = new AddressDto(
                order.getShippingAddress().getStreet(),
                order.getShippingAddress().getCity(),
                order.getShippingAddress().getState(),
                order.getShippingAddress().getZipCode(),
                order.getShippingAddress().getCountry()
            );
            dto.setShippingAddress(shippingAddress);
        }
        
        if (order.getBillingAddress() != null) {
            AddressDto billingAddress = new AddressDto(
                order.getBillingAddress().getStreet(),
                order.getBillingAddress().getCity(),
                order.getBillingAddress().getState(),
                order.getBillingAddress().getZipCode(),
                order.getBillingAddress().getCountry()
            );
            dto.setBillingAddress(billingAddress);
        }
        
        return dto;
    }
    
    private OrderItemDto convertOrderItemToDto(OrderItem orderItem) {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(orderItem.getId());
        dto.setProductId(orderItem.getProduct().getId());
        dto.setProductName(orderItem.getProduct().getName());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setQuantity(orderItem.getQuantity());
        dto.setTotalPrice(orderItem.getUnitPrice().multiply(new java.math.BigDecimal(orderItem.getQuantity())));
        return dto;
    }
    
    public static class OrderStatusUpdate {
        private String status;
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
