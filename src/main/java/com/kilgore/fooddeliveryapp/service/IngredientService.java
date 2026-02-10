package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.dto.request.CreateIngredientRequest;
import com.kilgore.fooddeliveryapp.dto.request.IngredientAvailableStatusRequest;
import com.kilgore.fooddeliveryapp.dto.response.IngredientResponse;
import com.kilgore.fooddeliveryapp.dto.response.RestaurantSummary;
import com.kilgore.fooddeliveryapp.exceptions.EntityNotFoundException;
import com.kilgore.fooddeliveryapp.exceptions.RestaurantNotFoundException;
import com.kilgore.fooddeliveryapp.model.Ingredient;
import com.kilgore.fooddeliveryapp.model.Restaurant;
import com.kilgore.fooddeliveryapp.repository.IngredientRepository;
import com.kilgore.fooddeliveryapp.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IngredientService {

    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private IngredientRepository ingredientRepository;

    @Transactional
    public IngredientResponse createIngredient(Long restaurantId,
                                               CreateIngredientRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);

        Ingredient ingredient = new Ingredient();
        ingredient.setRestaurant(restaurant);
        ingredient.setIngredientName(request.getIngredientName());
        ingredient.setIngredientCategory(request.getIngredientCategory());
        ingredient.setAvailable(request.isAvailable());

        ingredientRepository.save(ingredient);

        return createResponse(ingredient);
    }

    public List<IngredientResponse> getIngredients(Long restaurantId) {
        verifyOwnerAccess(restaurantId);

        return ingredientRepository
                .findAllByRestaurant_RestaurantId(restaurantId)
                .stream()
                .map(this::createResponse)
                .toList();
    }

    @Transactional
    public IngredientResponse updateIngredient(Long restaurantId, Long ingredientId,
                                               CreateIngredientRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);

        Ingredient ingredient = checkIngredient(restaurant,  ingredientId);

        ingredient.setIngredientName(request.getIngredientName());
        ingredient.setIngredientCategory(request.getIngredientCategory());
        ingredient.setAvailable(request.isAvailable());

        ingredientRepository.save(ingredient);

        return createResponse(ingredient);
    }

    @Transactional
    public IngredientResponse updateAvailability(Long restaurantId, Long ingredientId,
                                                 IngredientAvailableStatusRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);
        Ingredient ingredient = checkIngredient(restaurant,  ingredientId);

        ingredient.setAvailable(request.isAvailable());

        return createResponse(ingredient);
    }

    @Transactional
    public String deleteIngredient(Long restaurantId, Long ingredientId) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);
        Ingredient ingredient = checkIngredient(restaurant, ingredientId);

        ingredientRepository.delete(ingredient);

        return "deleted";
    }

    /* HELPING METHODS */

    private Restaurant verifyOwnerAccess(Long restaurantId) {
        String username =  SecurityContextHolder.getContext()
                .getAuthentication().getName();

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RestaurantNotFoundException(restaurantId));

        if(!restaurant.getOwner().getEmail().equals(username)){
            throw new AccessDeniedException("You are not allowed to perform this action of accessing Ingredients for this restaurant.");
        }
        return restaurant;
    }

    private IngredientResponse createResponse(Ingredient ingredient) {

        RestaurantSummary restaurant = new RestaurantSummary();
        restaurant.setRestaurantId(ingredient.getRestaurant().getRestaurantId());
        restaurant.setRestaurantName(ingredient.getRestaurant().getRestaurantName());

        return new IngredientResponse(
                ingredient.getIngredientId(),
                ingredient.getIngredientName(),
                ingredient.getIngredientCategory(),
                restaurant,
                ingredient.isAvailable()
        );
    }

    private Ingredient checkIngredient(Restaurant restaurant, Long ingredientId) {
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new EntityNotFoundException("Ingredient not found with id " + ingredientId));

        if(!ingredient.getRestaurant().getRestaurantId().equals(restaurant.getRestaurantId())) {
            throw new AccessDeniedException("You are not allowed to perform this action of updating Ingredients for this restaurant.");
        }

        return ingredient;
    }

}
