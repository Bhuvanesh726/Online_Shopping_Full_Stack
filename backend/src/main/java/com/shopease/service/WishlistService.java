package com.shopease.service;

import com.shopease.dto.ProductDto;
import com.shopease.model.Product;
import com.shopease.model.User;
import com.shopease.model.WishlistItem;
import com.shopease.repository.ProductRepository;
import com.shopease.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public List<ProductDto.ProductResponse> getWishlist(User user) {
        List<WishlistItem> items = wishlistItemRepository.findByUserId(user.getId());
        return items.stream()
                .map(item -> {
                    ProductDto.ProductResponse resp = productService.mapToResponse(item.getProduct());
                    resp.setInWishlist(true);
                    return resp;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto.ProductResponse addToWishlist(User user, Long productId) {
        if (wishlistItemRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new RuntimeException("Product already in wishlist");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();

        wishlistItemRepository.save(item);

        ProductDto.ProductResponse resp = productService.mapToResponse(product);
        resp.setInWishlist(true);
        return resp;
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        WishlistItem item = wishlistItemRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found in wishlist"));
        wishlistItemRepository.delete(item);
    }

    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistItemRepository.existsByUserIdAndProductId(userId, productId);
    }
}
