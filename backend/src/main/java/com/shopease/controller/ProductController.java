package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.dto.ProductDto;
import com.shopease.model.User;
import com.shopease.security.UserPrincipal;
import com.shopease.service.AuthService;
import com.shopease.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        ProductDto.ProductListResponse response = productService.getAllProducts(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Products fetched", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getProductById(@PathVariable Long id, Authentication authentication) {
        Long userId = null;
        if (authentication != null && authentication.isAuthenticated()) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            userId = principal.getId();
        }
        ProductDto.ProductResponse response = productService.getProductById(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Product fetched", response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        ProductDto.ProductListResponse response = productService.searchProducts(q, page, size);
        return ResponseEntity.ok(ApiResponse.success("Search results", response));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse> filterProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        ProductDto.ProductListResponse response = productService.filterProducts(
                categoryId, minPrice, maxPrice, brand, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Filtered products", response));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<ApiResponse> getNewArrivals() {
        List<ProductDto.ProductResponse> products = productService.getNewArrivals();
        return ResponseEntity.ok(ApiResponse.success("New arrivals", products));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<ApiResponse> getTopRated() {
        List<ProductDto.ProductResponse> products = productService.getTopRated();
        return ResponseEntity.ok(ApiResponse.success("Top rated", products));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse> getRelatedProducts(@PathVariable Long id) {
        List<ProductDto.ProductResponse> products = productService.getRelatedProducts(id);
        return ResponseEntity.ok(ApiResponse.success("Related products", products));
    }

    @GetMapping("/brands")
    public ResponseEntity<ApiResponse> getAllBrands() {
        List<String> brands = productService.getAllBrands();
        return ResponseEntity.ok(ApiResponse.success("Brands", brands));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createProduct(@RequestBody ProductDto.ProductRequest request) {
        try {
            User seller = authService.getCurrentUser();
            ProductDto.ProductResponse response = productService.createProduct(request, seller);
            return ResponseEntity.ok(ApiResponse.success("Product created", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProduct(@PathVariable Long id,
            @RequestBody ProductDto.ProductRequest request) {
        try {
            User seller = authService.getCurrentUser();
            ProductDto.ProductResponse response = productService.updateProduct(id, request, seller);
            return ResponseEntity.ok(ApiResponse.success("Product updated", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long id) {
        try {
            User seller = authService.getCurrentUser();
            productService.deleteProduct(id, seller);
            return ResponseEntity.ok(ApiResponse.success("Product deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/seller/my-products")
    public ResponseEntity<ApiResponse> getMyProducts() {
        try {
            User seller = authService.getCurrentUser();
            List<ProductDto.ProductResponse> products = productService.getSellerProducts(seller.getId());
            return ResponseEntity.ok(ApiResponse.success("Seller products", products));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
