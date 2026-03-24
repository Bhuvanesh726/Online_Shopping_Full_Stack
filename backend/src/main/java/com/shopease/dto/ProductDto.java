package com.shopease.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private String imageUrl;
        private String imageUrl2;
        private String imageUrl3;
        private Integer stock;
        private String brand;
        private String sku;
        private Long categoryId;
        private String returnPolicies;
        private String features;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private BigDecimal effectivePrice;
        private String imageUrl;
        private String imageUrl2;
        private String imageUrl3;
        private Integer stock;
        private String brand;
        private String sku;
        private BigDecimal rating;
        private Integer reviewCount;
        private String status;
        private String returnPolicies;
        private String features;
        private Long categoryId;
        private String categoryName;
        private Long sellerId;
        private String sellerName;
        private LocalDateTime createdAt;
        private Boolean inWishlist;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductListResponse {
        private List<ProductResponse> products;
        private int currentPage;
        private long totalItems;
        private int totalPages;
    }
}
