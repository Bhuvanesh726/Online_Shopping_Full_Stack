package com.shopease.controller;

import com.shopease.dto.ApiResponse;
import com.shopease.dto.OrderDto;
import com.shopease.model.Order;
import com.shopease.model.User;
import com.shopease.service.AuthService;
import com.shopease.service.OrderService;
import com.shopease.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final AuthService authService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse> checkout(@RequestBody OrderDto.CheckoutRequest request) {
        try {
            User user = authService.getCurrentUser();
            Order order = orderService.createOrderFromCart(user, request);
            String checkoutUrl = paymentService.createCheckoutSession(user, order);

            Map<String, Object> response = Map.of(
                    "checkoutUrl", checkoutUrl,
                    "orderId", order.getId());

            return ResponseEntity.ok(ApiResponse.success("Checkout session created", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getMyOrders() {
        User user = authService.getCurrentUser();
        List<OrderDto.OrderResponse> orders = orderService.getUserOrders(user);
        return ResponseEntity.ok(ApiResponse.success("Orders fetched", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long id) {
        try {
            User user = authService.getCurrentUser();
            OrderDto.OrderResponse order = orderService.getOrderById(id, user);
            return ResponseEntity.ok(ApiResponse.success("Order fetched", order));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/verify-payment")
    public ResponseEntity<ApiResponse> verifyPayment(@RequestParam String session_id) {
        try {
            paymentService.handlePaymentSuccess(session_id);
            Order order = orderService.findByStripeSessionId(session_id);
            OrderDto.OrderResponse response = orderService.mapToResponse(order);
            return ResponseEntity.ok(ApiResponse.success("Payment verified", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/seller")
    public ResponseEntity<ApiResponse> getSellerOrders() {
        try {
            User user = authService.getCurrentUser();
            List<OrderDto.OrderResponse> orders = orderService.getSellerOrders(user);
            return ResponseEntity.ok(ApiResponse.success("Seller orders fetched", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String statusStr = body.get("status");
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr);
            orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Order status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
