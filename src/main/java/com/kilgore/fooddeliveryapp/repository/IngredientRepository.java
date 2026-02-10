package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

     List<Ingredient> findAllByRestaurant_RestaurantId(Long restaurantId);
}
