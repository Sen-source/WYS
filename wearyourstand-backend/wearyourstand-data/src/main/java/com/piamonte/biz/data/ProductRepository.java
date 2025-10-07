package com.piamonte.biz.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("select p from Product p where p.stockQuantity > 0")
    List<Product> findAvailableProducts();

    List<Product> findByCategory(String category);
    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("select distinct p.category from Product p where p.category is not null")
    List<String> findDistinctCategories();
}























