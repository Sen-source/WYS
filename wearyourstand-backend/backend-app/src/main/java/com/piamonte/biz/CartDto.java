package com.piamonte.biz;

import java.math.BigDecimal;
import java.util.List;

public class CartDto {
    private Long id;
    private List<CartItemDto> cartItems;
    private BigDecimal totalAmount;
    private Integer totalItems;

    public CartDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<CartItemDto> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItemDto> cartItems) { this.cartItems = cartItems; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
}





















