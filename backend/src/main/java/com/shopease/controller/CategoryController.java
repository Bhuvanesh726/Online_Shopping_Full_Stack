package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.model.Category;
import com.shopease.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return ResponseEntity.ok(ApiResponse.success("Category fetched", category));
    }
}
