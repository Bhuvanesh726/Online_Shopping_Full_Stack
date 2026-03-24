package com.shopease.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "interaction_type")
    private String interactionType; // VIEW, CART, PURCHASE, WISHLIST

    @Column(name = "interaction_count")
    private Integer interactionCount;
}
