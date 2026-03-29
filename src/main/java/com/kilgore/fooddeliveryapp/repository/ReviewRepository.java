package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Review;
import com.kilgore.fooddeliveryapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review,Long> {

    boolean existsByUserUserIdAndRestaurantRestaurantIdAndPostedAtAfter(Long userId, Long restaurantId, LocalDateTime postedAt);

    List<Review> findByRestaurantRestaurantId(Long restaurantId);

    List<Review> findByUserUserId(Long userId);
}
