package com.piamonte.biz.service.impl;

import com.piamonte.biz.ProductService;
import com.piamonte.biz.data.Product;
import com.piamonte.biz.data.ProductRepository;
import com.piamonte.biz.data.ProductSizeVariant;
import com.piamonte.biz.data.ProductSizeVariantRepository;
import com.piamonte.biz.data.OrderItem;
import com.piamonte.biz.data.OrderItemRepository;
import com.piamonte.biz.data.CartItem;
import com.piamonte.biz.data.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductSizeVariantRepository productSizeVariantRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    @Override
    public List<Product> getAvailableProducts() {
        return productRepository.findAvailableProducts();
    }
    
    @Override
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }
    
    @Override
    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }
    
    @Override
    public List<String> getAllCategories() {
        return productRepository.findDistinctCategories();
    }
    
    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    @Override
    public Product createProduct(Product product) {
        try {
            System.out.println("=== PRODUCT SERVICE CREATE START ===");
            System.out.println("Product name: " + product.getName());
            System.out.println("Product status: " + product.getStatus());
            System.out.println("Product imageUrls: " + product.getImageUrls());
            
            // Validate required fields
            if (product.getName() == null || product.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Product name is required");
            }
            if (product.getDescription() == null || product.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Product description is required");
            }
            if (product.getPrice() == null || product.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Product price must be greater than 0");
            }
            if (product.getStockQuantity() == null || product.getStockQuantity() < 0) {
                throw new IllegalArgumentException("Product stock quantity must be non-negative");
            }
            if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
                throw new IllegalArgumentException("Product category is required");
            }
            
            // Ensure ID is null for new products
            product.setId(null);
            
            // Set default status if not provided
            if (product.getStatus() == null) {
                product.setStatus(Product.ProductStatus.ACTIVE);
            }
            
            // Initialize imageUrls if null
            if (product.getImageUrls() == null) {
                product.setImageUrls(new java.util.ArrayList<>());
            }
            
            System.out.println("Calling productRepository.save...");
            Product savedProduct = productRepository.save(product);
            System.out.println("Product created successfully with ID: " + savedProduct.getId());
            
            // Handle size variants
            if (product.getSizeVariants() != null && !product.getSizeVariants().isEmpty()) {
                System.out.println("Processing size variants: " + product.getSizeVariants().size());
                
                // Clear any existing size variants for this product
                productSizeVariantRepository.deleteByProductId(savedProduct.getId());
                
                // Save new size variants
                for (ProductSizeVariant variant : product.getSizeVariants()) {
                    variant.setProduct(savedProduct);
                    productSizeVariantRepository.save(variant);
                    System.out.println("Saved size variant: " + variant.getSize() + " - " + variant.getQuantity());
                }
                
                // Update the saved product with size variants
                savedProduct.setSizeVariants(product.getSizeVariants());
            } else {
                System.out.println("No size variants to process");
            }
            
            System.out.println("=== PRODUCT SERVICE CREATE SUCCESS ===");
            
            return savedProduct;
        } catch (Exception e) {
            System.out.println("=== PRODUCT SERVICE CREATE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public Product updateProduct(Product product) {
        try {
            System.out.println("=== PRODUCT SERVICE UPDATE START ===");
            System.out.println("Product ID: " + product.getId());
            System.out.println("Product name: " + product.getName());
            System.out.println("Product status: " + product.getStatus());
            System.out.println("Product imageUrls: " + product.getImageUrls());
            
            // Validate required fields only if they are being updated (not null)
            if (product.getName() != null && product.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Product name cannot be empty");
            }
            if (product.getDescription() != null && product.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Product description cannot be empty");
            }
            if (product.getPrice() != null && product.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Product price must be greater than 0");
            }
            if (product.getStockQuantity() != null && product.getStockQuantity() < 0) {
                throw new IllegalArgumentException("Product stock quantity must be non-negative");
            }
            if (product.getCategory() != null && product.getCategory().trim().isEmpty()) {
                throw new IllegalArgumentException("Product category cannot be empty");
            }
            
            // Check if product exists
            if (product.getId() == null) {
                throw new IllegalArgumentException("Product ID is required for update");
            }
            
            Optional<Product> existingProductOpt = productRepository.findById(product.getId());
            if (!existingProductOpt.isPresent()) {
                System.out.println("Product not found with ID: " + product.getId());
                throw new RuntimeException("Product not found with ID: " + product.getId());
            }
            
            Product existingProduct = existingProductOpt.get();
            System.out.println("Found existing product: " + existingProduct.getName());
            
            // Update only non-null fields, preserving relationships and timestamps
            if (product.getName() != null) {
                existingProduct.setName(product.getName());
            }
            if (product.getDescription() != null) {
                existingProduct.setDescription(product.getDescription());
            }
            if (product.getPrice() != null) {
                existingProduct.setPrice(product.getPrice());
            }
            if (product.getStockQuantity() != null) {
                existingProduct.setStockQuantity(product.getStockQuantity());
            }
            if (product.getCategory() != null) {
                existingProduct.setCategory(product.getCategory());
            }
            if (product.getBrand() != null) {
                existingProduct.setBrand(product.getBrand());
            }
            
            // Handle imageUrls - use a more robust approach
            if (product.getImageUrls() != null) {
                System.out.println("Updating imageUrls: " + product.getImageUrls());
                // Initialize imageUrls if null
                if (existingProduct.getImageUrls() == null) {
                    existingProduct.setImageUrls(new ArrayList<>());
                }
                // Clear and add new imageUrls
                existingProduct.getImageUrls().clear();
                existingProduct.getImageUrls().addAll(product.getImageUrls());
            } else {
                System.out.println("No imageUrls provided, keeping existing: " + existingProduct.getImageUrls());
            }
            
            // Handle size variants
            if (product.getSizeVariants() != null) {
                System.out.println("Processing size variants: " + product.getSizeVariants().size());
                
                // Clear existing size variants for this product
                productSizeVariantRepository.deleteByProductId(existingProduct.getId());
                
                // Save new size variants
                for (ProductSizeVariant variant : product.getSizeVariants()) {
                    variant.setProduct(existingProduct);
                    productSizeVariantRepository.save(variant);
                    System.out.println("Updated size variant: " + variant.getSize() + " - " + variant.getQuantity());
                }
                
                // Update the existing product with new size variants
                existingProduct.setSizeVariants(product.getSizeVariants());
            } else {
                System.out.println("No size variants provided, keeping existing");
            }
            
            if (product.getSize() != null) {
                existingProduct.setSize(product.getSize());
            }
            if (product.getColor() != null) {
                existingProduct.setColor(product.getColor());
            }
            if (product.getStatus() != null) {
                existingProduct.setStatus(product.getStatus());
            }
            // Don't touch relationships (orderItems, cartItems) to avoid lazy loading issues
            // Don't touch timestamps - they are handled by @PreUpdate
            
            System.out.println("Calling productRepository.save...");
            Product savedProduct = productRepository.save(existingProduct);
            System.out.println("Product saved successfully with ID: " + savedProduct.getId());
            System.out.println("=== PRODUCT SERVICE UPDATE SUCCESS ===");
            
            return savedProduct;
        } catch (Exception e) {
            System.out.println("=== PRODUCT SERVICE UPDATE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public void deleteProduct(Long id) {
        try {
            System.out.println("=== PRODUCT SERVICE DELETE START ===");
            System.out.println("DELETE: Starting deletion for product ID: " + id);
            
            if (id == null) {
                throw new IllegalArgumentException("Product ID cannot be null");
            }
            
            Optional<Product> productOpt = productRepository.findById(id);
            if (!productOpt.isPresent()) {
                throw new RuntimeException("Product with ID " + id + " not found");
            }
            
            Product product = productOpt.get();
            System.out.println("Found product: " + product.getName());
            
            // Simple approach: try to delete directly and let database handle constraints
            System.out.println("Attempting to delete product with ID: " + id);
            productRepository.deleteById(id);
            System.out.println("DELETE: Product " + id + " deleted successfully");
            System.out.println("=== PRODUCT SERVICE DELETE SUCCESS ===");
            
        } catch (Exception e) {
            System.out.println("=== PRODUCT SERVICE DELETE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public void updateStock(Long productId, Integer quantity) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setStockQuantity(product.getStockQuantity() + quantity);
            productRepository.save(product);
        }
    }
    
    @Override
    public void markProductAsDiscontinued(Long id) {
        try {
            System.out.println("=== PRODUCT SERVICE MARK DISCONTINUED START ===");
            System.out.println("Product ID to mark as discontinued: " + id);
            
            // Validate input
            if (id == null) {
                throw new IllegalArgumentException("Product ID is required");
            }
            
            // Check if product exists
            Optional<Product> productOpt = productRepository.findById(id);
            if (!productOpt.isPresent()) {
                System.out.println("Product not found with ID: " + id);
                throw new RuntimeException("Product not found with ID: " + id);
            }
            
            Product product = productOpt.get();
            System.out.println("Found product: " + product.getName());
            
            // Mark as discontinued
            product.setStatus(Product.ProductStatus.DISCONTINUED);
            productRepository.save(product);
            System.out.println("Product marked as discontinued successfully");
            System.out.println("=== PRODUCT SERVICE MARK DISCONTINUED SUCCESS ===");
            
        } catch (Exception e) {
            System.out.println("=== PRODUCT SERVICE MARK DISCONTINUED ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}



