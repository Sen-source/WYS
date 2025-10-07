package com.piamonte.biz;

public class ProductSizeVariantDto {
    private String size;
    private Integer quantity;
    
    public ProductSizeVariantDto() {}
    
    public ProductSizeVariantDto(String size, Integer quantity) {
        this.size = size;
        this.quantity = quantity;
    }
    
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}







