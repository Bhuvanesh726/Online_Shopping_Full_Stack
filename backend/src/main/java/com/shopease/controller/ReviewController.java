package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.dto.ReviewDto;
import com.shopease.model.User;
import com.shopease.service.AuthService;
import com.shopease.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse> getProductReviews(@PathVariable Long productId) {
        List<ReviewDto.ReviewResponse> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched", reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createReview(@PathVariable Long productId,
            @RequestBody ReviewDto.ReviewRequest request) {
        try {
            User user = authService.getCurrentUser();
            ReviewDto.ReviewResponse response = reviewService.createReview(productId, request, user);
            return ResponseEntity.ok(ApiResponse.success("Review created", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
