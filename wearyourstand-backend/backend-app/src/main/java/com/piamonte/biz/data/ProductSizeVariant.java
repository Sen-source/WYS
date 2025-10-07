package com.piamonte.biz.data;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "product_size_variants")
public class ProductSizeVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Enumerated(EnumType.STRING)
    @NotNull
    private Product.Size size;
    
    @Min(0)
    @NotNull
    private Integer quantity;
    
    // Constructors
    public ProductSizeVariant() {}
    
    public ProductSizeVariant(Product product, Product.Size size, Integer quantity) {
        this.product = product;
        this.size = size;
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public Product.Size getSize() { return size; }
    public void setSize(Product.Size size) { this.size = size; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}