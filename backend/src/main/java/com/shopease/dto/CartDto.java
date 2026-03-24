package com.shopease.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class CartDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCartRequest {
        private Integer quantity;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private BigDecimal productPrice;
        private BigDecimal discountPrice;
        private BigDecimal effectivePrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private Integer stock;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartResponse {
        private List<CartItemResponse> items;
        private BigDecimal totalAmount;
        private int totalItems;
    }
}
