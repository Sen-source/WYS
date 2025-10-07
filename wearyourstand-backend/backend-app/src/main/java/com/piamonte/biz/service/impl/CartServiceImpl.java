package com.piamonte.biz.service.impl;

import com.piamonte.biz.CartService;
import com.piamonte.biz.data.*;
import com.piamonte.biz.CartDto;
import com.piamonte.biz.CartItemDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartServiceImpl implements CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public Cart getOrCreateCart(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            return cartOpt.get();
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Cart cart = new Cart(user);
        return cartRepository.save(cart);
    }
    
    @Override
    public CartDto addToCart(Long userId, Long productId, Integer quantity) {
        // Validate input parameters
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException("Invalid product ID");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        // Get or create cart for user
        Cart cart = getOrCreateCart(userId);
        
        // Find product and validate it exists
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));
        
        // Check if product is available
        if (product.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("Product is out of stock");
        }
        
        // Check if adding this quantity would exceed stock
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartAndProduct(cart, product);
        int currentQuantityInCart = existingItemOpt.map(CartItem::getQuantity).orElse(0);
        
        if (currentQuantityInCart + quantity > product.getStockQuantity()) {
            throw new IllegalArgumentException("Cannot add " + quantity + " items. Only " + 
                (product.getStockQuantity() - currentQuantityInCart) + " items available in stock.");
        }
        
        // Add or update cart item
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = new CartItem(cart, product, quantity, product.getPrice());
            cartItemRepository.save(cartItem);
        }
        
        // Update cart total and return updated cart
        updateCartTotal(cart);
        return getCartDto(userId);
    }
    
    @Override
    public CartDto updateCartItemQuantity(Long cartItemId, Integer quantity) {
        try {
            System.out.println("Updating cart item ID: " + cartItemId + " to quantity: " + quantity);
            
            // Validate input parameters
            if (cartItemId == null || cartItemId <= 0) {
                throw new IllegalArgumentException("Invalid cart item ID");
            }
            if (quantity == null || quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0");
            }
            
            CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found with ID: " + cartItemId));
            
            System.out.println("Found cart item: " + cartItem.getId() + " for product: " + cartItem.getProduct().getName());
            
            // Check if new quantity exceeds product stock
            Product product = cartItem.getProduct();
            System.out.println("Product stock quantity: " + product.getStockQuantity());
            
            if (quantity > product.getStockQuantity()) {
                throw new IllegalArgumentException("Cannot set quantity to " + quantity + 
                    ". Only " + product.getStockQuantity() + " items available in stock.");
            }
            
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
            System.out.println("Cart item saved successfully");
            
            updateCartTotal(cartItem.getCart());
            System.out.println("Cart total updated");
            
            return getCartDto(cartItem.getCart().getUser().getId());
            
        } catch (Exception e) {
            System.err.println("Error in updateCartItemQuantity: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public CartDto removeFromCart(Long cartItemId) {
        // Validate input parameters
        if (cartItemId == null || cartItemId <= 0) {
            throw new IllegalArgumentException("Invalid cart item ID");
        }
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found with ID: " + cartItemId));
        
        Cart cart = cartItem.getCart();
        Long userId = cart.getUser().getId();
        
        cartItemRepository.delete(cartItem);
        updateCartTotal(cart);
        
        return getCartDto(userId);
    }
    
    @Override
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
    }
    
    @Override
    public CartDto getCartDto(Long userId) {
        Cart cart = getOrCreateCart(userId);
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        
        CartDto cartDto = new CartDto();
        cartDto.setId(cart.getId());
        
        List<CartItemDto> cartItemDtos = cartItems.stream()
            .map(this::convertToCartItemDto)
            .collect(Collectors.toList());
        
        cartDto.setCartItems(cartItemDtos);
        cartDto.setTotalAmount(cart.getTotalAmount());
        cartDto.setTotalItems(cartItems.size());
        
        return cartDto;
    }
    
    @Override
    public BigDecimal calculateCartTotal(Long userId) {
        Cart cart = getOrCreateCart(userId);
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        
        BigDecimal total = cartItems.stream()
            .map(CartItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        cart.setTotalAmount(total);
        cartRepository.save(cart);
        
        return total;
    }
    
    private void updateCartTotal(Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        BigDecimal total = cartItems.stream()
            .map(CartItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }
    
    private CartItemDto convertToCartItemDto(CartItem cartItem) {
        CartItemDto dto = new CartItemDto();
        dto.setId(cartItem.getId());
        dto.setProductId(cartItem.getProduct().getId());
        dto.setProductName(cartItem.getProduct().getName());
        dto.setUnitPrice(cartItem.getUnitPrice());
        dto.setQuantity(cartItem.getQuantity());
        dto.setTotalPrice(cartItem.getTotalPrice());
        
        if (cartItem.getProduct().getImageUrls() != null && !cartItem.getProduct().getImageUrls().isEmpty()) {
            dto.setProductImage(cartItem.getProduct().getImageUrls().get(0));
        }
        
        return dto;
    }
}



