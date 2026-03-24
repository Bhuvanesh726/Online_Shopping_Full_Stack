package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.dto.AuthDto;
import com.shopease.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        try {
            AuthDto.AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        try {
            AuthDto.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid email or password"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Password reset link sent to your email", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(ApiResponse.success("Password reset successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser() {
        try {
            var user = authService.getCurrentUser();
            AuthDto.AuthResponse response = AuthDto.AuthResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();
            return ResponseEntity.ok(ApiResponse.success("User fetched", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
