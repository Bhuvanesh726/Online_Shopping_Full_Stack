package com.shopease.service;

import com.shopease.dto.CartDto;
import com.shopease.model.CartItem;
import com.shopease.model.Product;
import com.shopease.model.User;
import com.shopease.repository.CartItemRepository;
import com.shopease.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartDto.CartResponse getCart(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        List<CartDto.CartItemResponse> items = cartItems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        BigDecimal total = items.stream()
                .map(CartDto.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDto.CartResponse.builder()
                .items(items)
                .totalAmount(total)
                .totalItems(items.size())
                .build();
    }

    @Transactional
    public CartDto.CartItemResponse addToCart(User user, CartDto.AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(user.getId(), request.getProductId())
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        }

        cartItem = cartItemRepository.save(cartItem);
        return mapToResponse(cartItem);
    }

    @Transactional
    public CartDto.CartItemResponse updateCartItem(Long itemId, Integer quantity, User user) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (cartItem.getProduct().getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);
        return mapToResponse(cartItem);
    }

    @Transactional
    public void removeFromCart(Long itemId, User user) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUserId(user.getId());
    }

    private CartDto.CartItemResponse mapToResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal effectivePrice = product.getEffectivePrice();

        return CartDto.CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImageUrl())
                .productPrice(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .effectivePrice(effectivePrice)
                .quantity(cartItem.getQuantity())
                .subtotal(effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                .stock(product.getStock())
                .build();
    }
}
