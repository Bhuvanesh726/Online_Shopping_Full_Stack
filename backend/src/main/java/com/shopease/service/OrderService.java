package com.shopease.service;

import com.shopease.dto.OrderDto;
import com.shopease.model.*;
import com.shopease.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Order createOrderFromCart(User user, OrderDto.CheckoutRequest checkoutRequest) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }
            BigDecimal itemTotal = product.getEffectivePrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        if (totalAmount.compareTo(BigDecimal.valueOf(1)) < 0) {
            throw new RuntimeException("Minimum order amount is ₹1.00");
        }

        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .status(Order.OrderStatus.PENDING)
                .shippingName(checkoutRequest.getShippingName())
                .shippingAddress(checkoutRequest.getShippingAddress())
                .shippingCity(checkoutRequest.getShippingCity())
                .shippingState(checkoutRequest.getShippingState())
                .shippingZip(checkoutRequest.getShippingZip())
                .shippingPhone(checkoutRequest.getShippingPhone())
                .estimatedDelivery(LocalDateTime.now().plusDays(7))
                .build();

        order = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getEffectivePrice())
                    .productName(product.getName())
                    .productImage(product.getImageUrl())
                    .build();
            order.getOrderItems().add(orderItem);

            // Reduce stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteByUserId(user.getId());

        return order;
    }

    public List<OrderDto.OrderResponse> getUserOrders(User user) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public OrderDto.OrderResponse getOrderById(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return mapToResponse(order);
    }

    public List<OrderDto.OrderResponse> getSellerOrders(User seller) {
        List<Order> orders = orderRepository.findOrdersBySellerId(seller.getId());
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStripeSession(Long orderId, String sessionId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStripeSessionId(sessionId);
        return orderRepository.save(order);
    }

    public Order findByStripeSessionId(String sessionId) {
        return orderRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public OrderDto.OrderResponse mapToResponse(Order order) {
        List<OrderDto.OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderDto.OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProductName())
                        .productImage(item.getProductImage())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .sellerName(item.getProduct().getSeller() != null ? item.getProduct().getSeller().getName() : null)
                        .sellerGstNumber(item.getProduct().getSeller() != null ? item.getProduct().getSeller().getGstNumber() : null)
                        .sellerCompanyName(item.getProduct().getSeller() != null ? item.getProduct().getSeller().getCompanyName() : null)
                        .build())
                .collect(Collectors.toList());

        return OrderDto.OrderResponse.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .shippingName(order.getShippingName())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingZip(order.getShippingZip())
                .shippingPhone(order.getShippingPhone())
                .trackingNumber(order.getTrackingNumber())
                .estimatedDelivery(order.getEstimatedDelivery())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .userId(order.getUser().getId())
                .build();
    }
}
