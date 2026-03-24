package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.dto.CartDto;
import com.shopease.model.User;
import com.shopease.service.AuthService;
import com.shopease.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse> getCart() {
        User user = authService.getCurrentUser();
        CartDto.CartResponse response = cartService.getCart(user);
        return ResponseEntity.ok(ApiResponse.success("Cart fetched", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> addToCart(@RequestBody CartDto.AddToCartRequest request) {
        try {
            User user = authService.getCurrentUser();
            CartDto.CartItemResponse response = cartService.addToCart(user, request);
            return ResponseEntity.ok(ApiResponse.success("Added to cart", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse> updateCartItem(@PathVariable Long itemId,
            @RequestBody CartDto.UpdateCartRequest request) {
        try {
            User user = authService.getCurrentUser();
            CartDto.CartItemResponse response = cartService.updateCartItem(itemId, request.getQuantity(), user);
            return ResponseEntity.ok(ApiResponse.success("Cart updated", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse> removeFromCart(@PathVariable Long itemId) {
        try {
            User user = authService.getCurrentUser();
            cartService.removeFromCart(itemId, user);
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse> clearCart() {
        User user = authService.getCurrentUser();
        cartService.clearCart(user);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }
}
