package com.shopease.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutRequest {
        private String shippingName;
        private String shippingAddress;
        private String shippingCity;
        private String shippingState;
        private String shippingZip;
        private String shippingPhone;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private Long id;
        private BigDecimal totalAmount;
        private String status;
        private String shippingName;
        private String shippingAddress;
        private String shippingCity;
        private String shippingState;
        private String shippingZip;
        private String shippingPhone;
        private String trackingNumber;
        private LocalDateTime estimatedDelivery;
        private List<OrderItemResponse> items;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long userId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal subtotal;
        private String sellerName;
        private String sellerGstNumber;
        private String sellerCompanyName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentResponse {
        private String clientSecret;
        private String sessionId;
    }
}
