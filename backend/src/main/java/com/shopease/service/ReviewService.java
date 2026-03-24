package com.shopease.service;

import com.shopease.dto.ReviewDto;
import com.shopease.model.Product;
import com.shopease.model.Review;
import com.shopease.model.User;
import com.shopease.repository.ProductRepository;
import com.shopease.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public List<ReviewDto.ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto.ReviewResponse createReview(Long productId, ReviewDto.ReviewRequest request, User user) {
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        // Update product rating
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        Long reviewCount = reviewRepository.getReviewCountByProductId(productId);

        product.setRating(
                avgRating != null ? BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        product.setReviewCount(reviewCount != null ? reviewCount.intValue() : 0);
        productRepository.save(product);

        return mapToResponse(review);
    }

    private ReviewDto.ReviewResponse mapToResponse(Review review) {
        return ReviewDto.ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
