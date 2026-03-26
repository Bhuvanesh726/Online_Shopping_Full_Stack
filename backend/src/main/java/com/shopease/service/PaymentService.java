package com.shopease.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shopease.model.Order;
import com.shopease.model.User;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final OrderService orderService;
    private final EmailService emailService;
    
    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }

    public String createCheckoutSession(User user, Order order) throws RazorpayException {
        long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + order.getId());

        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        String razorpayOrderId = razorpayOrder.get("id");

        // We repurpose the stripeSessionId field to store the Razorpay Order ID
        orderService.updateOrderStripeSession(order.getId(), razorpayOrderId);

        // Return the Razorpay order ID to the frontend
        return razorpayOrderId;
    }

    @org.springframework.transaction.annotation.Transactional
    public void handlePaymentSuccess(String razorpayOrderId) {
        Order order = orderService.findByStripeSessionId(razorpayOrderId);
        if (order.getStatus() == Order.OrderStatus.PENDING) {
            orderService.updateOrderStatus(order.getId(), Order.OrderStatus.PAID);
            emailService.sendOrderConfirmation(order);
            emailService.sendSellerOrderNotification(order);
        }
    }
}
