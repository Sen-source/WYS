package com.piamonte.biz.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductSizeVariantRepository extends JpaRepository<ProductSizeVariant, Long> {
    List<ProductSizeVariant> findByProductId(Long productId);
    Optional<ProductSizeVariant> findByProductIdAndSize(Long productId, Product.Size size);
    void deleteByProductId(Long productId);
}