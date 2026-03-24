package com.shopease.controller;

import com.shopease.model.User;
import com.shopease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final com.shopease.repository.ProductRepository productRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> !u.getEmail().startsWith("deleted_"))
                .toList());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        
        user.setEmail("deleted_" + id + "@shopease.com");
        user.setName("Deleted User");
        user.setPassword("");
        user.setPhone(null);
        user.setAddress(null);
        user.setGstNumber(null);
        userRepository.save(user);

        if (user.getRole() == User.Role.SELLER) {
            List<com.shopease.model.Product> products = productRepository.findAll().stream()
                .filter(p -> p.getSeller() != null && p.getSeller().getId().equals(id))
                .toList();
            for (com.shopease.model.Product p : products) {
                p.setStatus(com.shopease.model.Product.Status.REMOVED);
                p.setStock(0);
                productRepository.save(p);
            }
        }
        
        return ResponseEntity.ok().build();
    }
}
