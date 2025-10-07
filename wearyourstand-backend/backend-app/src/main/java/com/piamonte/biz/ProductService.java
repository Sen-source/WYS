package com.piamonte.biz;

import com.piamonte.biz.data.Product;
import java.util.List;
import java.util.Optional;

public interface ProductService {
    List<Product> getAllProducts();
    List<Product> getAvailableProducts();
    List<Product> getProductsByCategory(String category);
    List<Product> searchProducts(String query);
    List<String> getAllCategories();
    Optional<Product> getProductById(Long id);
    Product createProduct(Product product);
    Product updateProduct(Product product);
    void deleteProduct(Long id);
    void updateStock(Long productId, Integer quantity);
    void markProductAsDiscontinued(Long id);
}





















