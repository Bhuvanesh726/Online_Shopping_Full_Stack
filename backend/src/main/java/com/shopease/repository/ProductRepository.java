package com.shopease.repository;

import com.shopease.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByStatus(Product.Status status, Pageable pageable);

    default Page<Product> findByActiveTrue(Pageable pageable) {
        return findByStatus(Product.Status.ACTIVE, pageable);
    }

    List<Product> findBySellerId(Long sellerId);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:brand IS NULL OR LOWER(p.brand) = LOWER(:brand))")
    Page<Product> findByFilters(@Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("brand") String brand,
            Pageable pageable);

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.brand IS NOT NULL AND p.status = 'ACTIVE'")
    List<String> findAllBrands();

    List<Product> findTop10ByStatusOrderByCreatedAtDesc(Product.Status status);

    default List<Product> findTop10ByActiveTrueOrderByCreatedAtDesc() {
        return findTop10ByStatusOrderByCreatedAtDesc(Product.Status.ACTIVE);
    }

    List<Product> findTop10ByStatusOrderByRatingDesc(Product.Status status);

    default List<Product> findTop10ByActiveTrueOrderByRatingDesc() {
        return findTop10ByStatusOrderByRatingDesc(Product.Status.ACTIVE);
    }

    List<Product> findByCategoryIdAndStatusAndIdNot(Long categoryId, Product.Status status, Long productId);

    default List<Product> findByCategoryIdAndActiveTrueAndIdNot(Long categoryId, Long productId) {
        return findByCategoryIdAndStatusAndIdNot(categoryId, Product.Status.ACTIVE, productId);
    }

    List<Product> findByIdIn(List<Long> ids);
}
