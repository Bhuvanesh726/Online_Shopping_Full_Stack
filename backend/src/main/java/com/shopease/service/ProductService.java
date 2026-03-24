package com.shopease.service;

import com.shopease.dto.ProductDto;
import com.shopease.model.*;
import com.shopease.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    public ProductDto.ProductListResponse getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findByActiveTrue(pageable);

        return buildProductListResponse(productPage, null);
    }

    public ProductDto.ProductListResponse searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.searchProducts(query, pageable);
        return buildProductListResponse(productPage, null);
    }

    public ProductDto.ProductListResponse filterProducts(Long categoryId, BigDecimal minPrice,
            BigDecimal maxPrice, String brand,
            int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findByFilters(categoryId, minPrice, maxPrice, brand, pageable);
        return buildProductListResponse(productPage, null);
    }

    public ProductDto.ProductResponse getProductById(Long id, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        ProductDto.ProductResponse response = mapToResponse(product);
        if (userId != null) {
            response.setInWishlist(wishlistItemRepository.existsByUserIdAndProductId(userId, id));
        }
        return response;
    }

    @Transactional
    public ProductDto.ProductResponse createProduct(ProductDto.ProductRequest request, User seller) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .imageUrl(request.getImageUrl())
                .imageUrl2(request.getImageUrl2())
                .imageUrl3(request.getImageUrl3())
                .stock(request.getStock())
                .brand(request.getBrand())
                .sku(request.getSku())
                .category(category)
                .seller(seller)
                .returnPolicies(request.getReturnPolicies())
                .features(request.getFeatures())
                .status(Product.Status.ACTIVE)
                .build();

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public ProductDto.ProductResponse updateProduct(Long id, ProductDto.ProductRequest request, User seller) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You can only update your own products");
        }

        if (request.getName() != null)
            product.setName(request.getName());
        if (request.getDescription() != null)
            product.setDescription(request.getDescription());
        if (request.getPrice() != null)
            product.setPrice(request.getPrice());
        if (request.getDiscountPrice() != null)
            product.setDiscountPrice(request.getDiscountPrice());
        if (request.getImageUrl() != null)
            product.setImageUrl(request.getImageUrl());
        if (request.getImageUrl2() != null)
            product.setImageUrl2(request.getImageUrl2());
        if (request.getImageUrl3() != null)
            product.setImageUrl3(request.getImageUrl3());
        if (request.getStock() != null)
            product.setStock(request.getStock());
        if (request.getBrand() != null)
            product.setBrand(request.getBrand());
        if (request.getReturnPolicies() != null)
            product.setReturnPolicies(request.getReturnPolicies());
        if (request.getFeatures() != null)
            product.setFeatures(request.getFeatures());
        if (request.getStatus() != null) {
            try {
                product.setStatus(Product.Status.valueOf(request.getStatus()));
            } catch (IllegalArgumentException ignored) {}
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id, User seller) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You can only delete your own products");
        }

        product.setStatus(Product.Status.REMOVED);
        productRepository.save(product);
    }

    public List<ProductDto.ProductResponse> getSellerProducts(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ProductDto.ProductResponse> getNewArrivals() {
        return productRepository.findTop10ByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ProductDto.ProductResponse> getTopRated() {
        return productRepository.findTop10ByActiveTrueOrderByRatingDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ProductDto.ProductResponse> getRelatedProducts(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getCategory() != null) {
            return productRepository.findByCategoryIdAndActiveTrueAndIdNot(
                    product.getCategory().getId(), productId)
                    .stream().limit(6).map(this::mapToResponse).collect(Collectors.toList());
        }
        return List.of();
    }

    public List<String> getAllBrands() {
        return productRepository.findAllBrands();
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void trackUserPreference(Long userId, Product product, String interactionType) {
        try {
            if (product.getCategory() != null) {
                UserPreference pref = userPreferenceRepository
                        .findByUserIdAndCategoryId(userId, product.getCategory().getId())
                        .orElse(UserPreference.builder()
                                .user(User.builder().id(userId).build())
                                .category(product.getCategory())
                                .interactionType(interactionType)
                                .interactionCount(0)
                                .build());
                pref.setInteractionCount(pref.getInteractionCount() + 1);
                userPreferenceRepository.save(pref);
            }
        } catch (Exception e) {
            // silently fail - preferences are non-critical
        }
    }

    private ProductDto.ProductListResponse buildProductListResponse(Page<Product> productPage, Long userId) {
        List<ProductDto.ProductResponse> products = productPage.getContent()
                .stream().map(this::mapToResponse).collect(Collectors.toList());

        return ProductDto.ProductListResponse.builder()
                .products(products)
                .currentPage(productPage.getNumber())
                .totalItems(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .build();
    }

    public ProductDto.ProductResponse mapToResponse(Product product) {
        return ProductDto.ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .effectivePrice(product.getEffectivePrice())
                .imageUrl(product.getImageUrl())
                .imageUrl2(product.getImageUrl2())
                .imageUrl3(product.getImageUrl3())
                .stock(product.getStock())
                .brand(product.getBrand())
                .sku(product.getSku())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .status(product.getStatus() != null ? product.getStatus().name() : "ACTIVE")
                .returnPolicies(product.getReturnPolicies())
                .features(product.getFeatures())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerName(product.getSeller() != null ? product.getSeller().getName() : null)
                .createdAt(product.getCreatedAt())
                .inWishlist(false)
                .build();
    }
}
