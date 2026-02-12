package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.dto.request.CreateAddonRequest;
import com.kilgore.fooddeliveryapp.dto.request.AddonAvailableStatusRequest;
import com.kilgore.fooddeliveryapp.dto.response.AddonResponse;
import com.kilgore.fooddeliveryapp.dto.response.RestaurantSummary;
import com.kilgore.fooddeliveryapp.exceptions.EntityNotFoundException;
import com.kilgore.fooddeliveryapp.exceptions.RestaurantNotFoundException;
import com.kilgore.fooddeliveryapp.model.Addon;
import com.kilgore.fooddeliveryapp.model.Restaurant;
import com.kilgore.fooddeliveryapp.repository.AddonRepository;
import com.kilgore.fooddeliveryapp.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddonService {

    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private AddonRepository ingredientRepository;

    @Transactional
    public AddonResponse createAddon(Long restaurantId,
                                               CreateAddonRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);

        Addon ingredient = new Addon();
        ingredient.setRestaurant(restaurant);
        ingredient.setAddonName(request.getAddonName());
        ingredient.setCategory(request.getCategory());
        ingredient.setAvailable(request.isAvailable());

       ingredientRepository.save(ingredient);

        return createResponse(ingredient);
    }

    public List<AddonResponse> getAddons(Long restaurantId) {
        verifyOwnerAccess(restaurantId);

        return ingredientRepository
                .findAllByRestaurant_RestaurantId(restaurantId)
                .stream()
                .map(this::createResponse)
                .toList();
    }

    @Transactional
    public AddonResponse updateAddon(Long restaurantId, Long ingredientId,
                                               CreateAddonRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);

        Addon ingredient = checkAddon(restaurant,  ingredientId);

        ingredient.setAddonName(request.getAddonName());
        ingredient.setCategory(request.getCategory());
        ingredient.setAvailable(request.isAvailable());

        ingredientRepository.save(ingredient);

        return createResponse(ingredient);
    }

    @Transactional
    public AddonResponse updateAvailability(Long restaurantId, Long ingredientId,
                                                 AddonAvailableStatusRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);
        Addon ingredient = checkAddon(restaurant,  ingredientId);

        ingredient.setAvailable(request.isAvailable());

        return createResponse(ingredient);
    }

    @Transactional
    public String deleteAddon(Long restaurantId, Long ingredientId) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);
        Addon ingredient = checkAddon(restaurant, ingredientId);

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
            throw new AccessDeniedException("You are not allowed to perform this action of accessing Addons for this restaurant.");
        }
        return restaurant;
    }

    private AddonResponse createResponse(Addon ingredient) {

        RestaurantSummary restaurant = new RestaurantSummary();
        restaurant.setRestaurantId(ingredient.getRestaurant().getRestaurantId());
        restaurant.setRestaurantName(ingredient.getRestaurant().getRestaurantName());

        return new AddonResponse(
                ingredient.getAddonId(),
                ingredient.getAddonName(),
                ingredient.getCategory(),
                restaurant,
                ingredient.isAvailable()
        );
    }

    private Addon checkAddon(Restaurant restaurant, Long ingredientId) {
        Addon ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new EntityNotFoundException("Addon not found with id " + ingredientId));

        if(!ingredient.getRestaurant().getRestaurantId().equals(restaurant.getRestaurantId())) {
            throw new AccessDeniedException("You are not allowed to perform this action of updating Addons for this restaurant.");
        }

        return ingredient;
    }

}
