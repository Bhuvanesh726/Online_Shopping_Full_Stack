package com.shopease.service;

import com.shopease.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private static final String FROM = "shopeaseshoppingapp@gmail.com";

    private void sendSilently(SimpleMailMessage message) {
        try {
            emailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + message.getTo() + ": " + e.getMessage());
        }
    }

    // ── Buyer: Order Confirmation ──────────────────────────────────────────────
    public void sendOrderConfirmation(Order order) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(FROM);
        msg.setTo(order.getUser().getEmail());
        msg.setSubject("✅ ShopEase Order Confirmed - #" + order.getId());
        msg.setText(
            "Dear " + order.getShippingName() + ",\n\n"
            + "Thank you for shopping with ShopEase! 🎉\n\n"
            + "Your Order #" + order.getId() + " has been placed successfully.\n"
            + "Total Amount: ₹" + order.getTotalAmount() + "\n"
            + "Shipping to: " + order.getShippingAddress() + ", " + order.getShippingCity() + ", " + order.getShippingState() + "\n\n"
            + "Track your order anytime from your ShopEase dashboard.\n\n"
            + "Best Regards,\nShopEase Team"
        );
        sendSilently(msg);
    }

    // ── Seller: New Order Notification ────────────────────────────────────────
    public void sendSellerOrderNotification(Order order) {
        // Group items by seller and send one email per seller
        order.getOrderItems().stream()
            .filter(item -> item.getProduct().getSeller() != null)
            .collect(Collectors.groupingBy(item -> item.getProduct().getSeller()))
            .forEach((seller, items) -> {
                String itemsList = items.stream()
                    .map(item -> "  • " + item.getProductName() + " × " + item.getQuantity()
                            + "  (₹" + item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())) + ")")
                    .collect(Collectors.joining("\n"));

                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(FROM);
                msg.setTo(seller.getEmail());
                msg.setSubject("🛒 New Order Received - ShopEase Order #" + order.getId());
                msg.setText(
                    "Hello " + seller.getName() + ",\n\n"
                    + "Great news! You have received a new order on ShopEase.\n\n"
                    + "Order #" + order.getId() + "\n"
                    + "──────────────────────────────\n"
                    + itemsList + "\n"
                    + "──────────────────────────────\n"
                    + "Ship to: " + order.getShippingName() + "\n"
                    + "Address: " + order.getShippingAddress() + ", " + order.getShippingCity() + ", " + order.getShippingState() + "\n"
                    + "Phone: " + order.getShippingPhone() + "\n\n"
                    + "Please log in to your Seller Dashboard to process this order.\n"
                    + frontendUrl + "/seller?tab=orders\n\n"
                    + "Best Regards,\nShopEase Team"
                );
                sendSilently(msg);
            });
    }

    // ── Password Reset Email ───────────────────────────────────────────────────
    public void sendPasswordResetEmail(String toEmail, String jwtResetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + jwtResetToken;
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(FROM);
        msg.setTo(toEmail);
        msg.setSubject("🔐 ShopEase Password Reset Request");
        msg.setText(
            "Hello,\n\n"
            + "We received a request to reset your ShopEase account password.\n\n"
            + "Click the link below to reset your password (valid for 1 hour):\n\n"
            + resetLink + "\n\n"
            + "If you did not request a password reset, please ignore this email — "
            + "your account remains secure.\n\n"
            + "Best Regards,\nShopEase Team"
        );
        sendSilently(msg);
    }
}
