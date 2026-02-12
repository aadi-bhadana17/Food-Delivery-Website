package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Addon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddonRepository extends JpaRepository<Addon, Long> {

     List<Addon> findAllByRestaurant_RestaurantId(Long restaurantId);
}
