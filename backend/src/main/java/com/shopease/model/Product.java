package com.shopease.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "discount_price", precision = 10, scale = 2)
    private BigDecimal discountPrice;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_url_2")
    private String imageUrl2;

    @Column(name = "image_url_3")
    private String imageUrl3;

    @Column(nullable = false)
    private Integer stock;

    private String brand;
    private String sku;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "return_policies", columnDefinition = "TEXT")
    private String returnPolicies;

    @Column(columnDefinition = "TEXT")
    private String features;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    public enum Status {
        ACTIVE, OUT_OF_STOCK, REMOVED
    }

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    @JsonIgnore
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public BigDecimal getEffectivePrice() {
        return discountPrice != null && discountPrice.compareTo(BigDecimal.ZERO) > 0
                ? discountPrice
                : price;
    }
}
