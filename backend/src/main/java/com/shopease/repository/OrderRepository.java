package com.shopease.repository;

import com.shopease.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByStripeSessionId(String stripeSessionId);

    List<Order> findByStatus(Order.OrderStatus status);

    @org.springframework.data.jpa.repository.Query(
            "SELECT DISTINCT o FROM Order o JOIN o.orderItems oi WHERE oi.product.seller.id = :sellerId ORDER BY o.createdAt DESC")
    List<Order> findOrdersBySellerId(@org.springframework.data.repository.query.Param("sellerId") Long sellerId);
}
