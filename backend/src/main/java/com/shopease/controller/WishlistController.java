package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.dto.ProductDto;
import com.shopease.model.User;
import com.shopease.service.AuthService;
import com.shopease.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse> getWishlist() {
        User user = authService.getCurrentUser();
        List<ProductDto.ProductResponse> items = wishlistService.getWishlist(user);
        return ResponseEntity.ok(ApiResponse.success("Wishlist fetched", items));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse> addToWishlist(@PathVariable Long productId) {
        try {
            User user = authService.getCurrentUser();
            ProductDto.ProductResponse response = wishlistService.addToWishlist(user, productId);
            return ResponseEntity.ok(ApiResponse.success("Added to wishlist", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse> removeFromWishlist(@PathVariable Long productId) {
        try {
            User user = authService.getCurrentUser();
            wishlistService.removeFromWishlist(user, productId);
            return ResponseEntity.ok(ApiResponse.success("Removed from wishlist"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
