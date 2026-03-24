package com.shopease.service;

import com.shopease.dto.AuthDto;
import com.shopease.model.User;
import com.shopease.repository.UserRepository;
import com.shopease.security.JwtTokenProvider;
import com.shopease.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        User.Role role = User.Role.BUYER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("SELLER")) {
            role = User.Role.SELLER;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .gstNumber(request.getGstNumber())
                .companyName(request.getCompanyName())
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromUserId(
                user.getId(), user.getEmail(), user.getName(), user.getRole().name());

        return AuthDto.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return AuthDto.AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userPrincipal.getId())
                .name(userPrincipal.getName())
                .email(userPrincipal.getEmail())
                .role(userPrincipal.getRole())
                .build();
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));

        // Generate a signed JWT as the reset token (expires in 1 hour)
        String jwtResetToken = tokenProvider.generatePasswordResetToken(email);

        // Email the reset link — never expose the token in the API response
        emailService.sendPasswordResetEmail(user.getEmail(), jwtResetToken);
    }

    @Transactional
    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        // Validate JWT and extract email
        String email;
        try {
            email = tokenProvider.getEmailFromResetToken(request.getToken());
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not authenticated");
        }
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
