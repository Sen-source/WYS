package com.piamonte.biz;

import com.piamonte.biz.data.Cart;
import com.piamonte.biz.data.CartItem;
import java.math.BigDecimal;

public interface CartService {
    Cart getOrCreateCart(Long userId);
    CartDto addToCart(Long userId, Long productId, Integer quantity);
    CartDto updateCartItemQuantity(Long cartItemId, Integer quantity);
    CartDto removeFromCart(Long cartItemId);
    void clearCart(Long userId);
    CartDto getCartDto(Long userId);
    BigDecimal calculateCartTotal(Long userId);
}





















