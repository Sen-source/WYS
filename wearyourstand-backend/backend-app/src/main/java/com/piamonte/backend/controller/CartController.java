package com.piamonte.backend.controller;

import com.piamonte.biz.CartDto;
import com.piamonte.biz.CartService;
import com.piamonte.biz.data.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @GetMapping
    public ResponseEntity<CartDto> getCart() {
        try {
            Long userId = getCurrentUserId();
            CartDto cart = cartService.getCartDto(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addToCart(
            @RequestParam Long productId, 
            @RequestParam Integer quantity) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate input parameters
            if (productId == null || productId <= 0) {
                response.put("success", false);
                response.put("message", "Invalid product ID");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (quantity == null || quantity <= 0) {
                response.put("success", false);
                response.put("message", "Quantity must be greater than 0");
                return ResponseEntity.badRequest().body(response);
            }
            
            Long userId = getCurrentUserId();
            CartDto updatedCart = cartService.addToCart(userId, productId, quantity);
            
            response.put("success", true);
            response.put("message", "Product added to cart successfully");
            response.put("cart", updatedCart);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to add product to cart. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<Map<String, Object>> updateCartItem(
            @PathVariable Long cartItemId, 
            @RequestParam Integer quantity) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("CartController: Updating cart item " + cartItemId + " to quantity " + quantity);
            
            if (quantity == null || quantity <= 0) {
                response.put("success", false);
                response.put("message", "Quantity must be greater than 0");
                return ResponseEntity.badRequest().body(response);
            }
            
            CartDto updatedCart = cartService.updateCartItemQuantity(cartItemId, quantity);
            
            response.put("success", true);
            response.put("message", "Cart item updated successfully");
            response.put("cart", updatedCart);
            
            System.out.println("CartController: Update successful");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("CartController: IllegalArgumentException - " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            System.err.println("CartController: Exception - " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to update cart item. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long cartItemId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            CartDto updatedCart = cartService.removeFromCart(cartItemId);
            
            response.put("success", true);
            response.put("message", "Item removed from cart successfully");
            response.put("cart", updatedCart);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to remove item from cart. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearCart() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = getCurrentUserId();
            cartService.clearCart(userId);
            
            response.put("success", true);
            response.put("message", "Cart cleared successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to clear cart. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return ((User) authentication.getPrincipal()).getId();
        }
        throw new RuntimeException("User not authenticated");
    }
}
