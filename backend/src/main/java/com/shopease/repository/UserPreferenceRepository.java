package com.shopease.repository;

import com.shopease.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    List<UserPreference> findByUserId(Long userId);

    Optional<UserPreference> findByUserIdAndCategoryId(Long userId, Long categoryId);

    Optional<UserPreference> findByUserIdAndProductIdAndInteractionType(Long userId, Long productId,
            String interactionType);

    @Query("SELECT up.category.id FROM UserPreference up WHERE up.user.id = :userId " +
            "GROUP BY up.category.id ORDER BY SUM(up.interactionCount) DESC")
    List<Long> findTopCategoryIdsByUserId(@Param("userId") Long userId);

    @Query("SELECT up.productId FROM UserPreference up WHERE up.user.id = :userId AND up.productId IS NOT NULL " +
            "ORDER BY up.interactionCount DESC")
    List<Long> findTopProductIdsByUserId(@Param("userId") Long userId);
}
