package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.dto.ProductDto;
import com.shopease.model.User;
import com.shopease.service.AuthService;
import com.shopease.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse> getRecommendations() {
        try {
            User user = authService.getCurrentUser();
            List<ProductDto.ProductResponse> recommendations = recommendationService
                    .getPersonalizedRecommendations(user);
            return ResponseEntity.ok(ApiResponse.success("Personalized recommendations", recommendations));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse> getPublicRecommendations() {
        List<ProductDto.ProductResponse> recommendations = recommendationService.getPublicRecommendations();
        return ResponseEntity.ok(ApiResponse.success("Popular products", recommendations));
    }
}
