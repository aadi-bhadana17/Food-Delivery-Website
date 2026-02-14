package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.dto.request.CreateAddonRequest;
import com.kilgore.fooddeliveryapp.dto.request.AddonAvailableStatusRequest;
import com.kilgore.fooddeliveryapp.dto.response.AddonResponse;
import com.kilgore.fooddeliveryapp.dto.summary.CategorySummary;
import com.kilgore.fooddeliveryapp.dto.summary.RestaurantSummary;
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
    private AddonRepository addonRepository;

    @Transactional
    public AddonResponse createAddon(Long restaurantId,
                                               CreateAddonRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);

        Addon addon = new Addon();
        addon.setRestaurant(restaurant);
        addon.setAddonName(request.getAddonName());
        addon.setAvailable(request.isAvailable());


        addonRepository.save(addon);

        return createResponse(addon);
    }

    public List<AddonResponse> getAddons(Long restaurantId) {
        verifyOwnerAccess(restaurantId);

        return addonRepository
                .findAllByRestaurant_RestaurantId(restaurantId)
                .stream()
                .map(this::createResponse)
                .toList();
    }

    @Transactional
    public AddonResponse updateAddon(Long restaurantId, Long addonId,
                                               CreateAddonRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);

        Addon addon = checkAddon(restaurant,  addonId);

        addon.setAddonName(request.getAddonName());
        addon.setAvailable(request.isAvailable());

        addonRepository.save(addon);

        return createResponse(addon);
    }

    @Transactional
    public AddonResponse updateAvailability(Long restaurantId, Long addonId,
                                                 AddonAvailableStatusRequest request) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);
        Addon addon = checkAddon(restaurant,  addonId);

        addon.setAvailable(request.isAvailable());

        return createResponse(addon);
    }

    @Transactional
    public String deleteAddon(Long restaurantId, Long addonId) {
        Restaurant restaurant = verifyOwnerAccess(restaurantId);
        Addon addon = checkAddon(restaurant, addonId);

        addonRepository.delete(addon);

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

    private AddonResponse createResponse(Addon addon) {

        RestaurantSummary restaurant = new RestaurantSummary();
        restaurant.setRestaurantId(addon.getRestaurant().getRestaurantId());
        restaurant.setRestaurantName(addon.getRestaurant().getRestaurantName());

        List<CategorySummary> categories = addon.getCategories().stream()
                .map(category -> new CategorySummary(
                        category.getCategoryId(),
                        category.getCategoryName()
                ))
                .toList();


        return new AddonResponse(
                addon.getAddonId(),
                addon.getAddonName(),
                categories,
                restaurant,
                addon.isAvailable()
        );
    }

    private Addon checkAddon(Restaurant restaurant, Long addonId) {
        Addon addon = addonRepository.findById(addonId)
                .orElseThrow(() -> new EntityNotFoundException("Addon not found with id " + addonId));

        if(!addon.getRestaurant().getRestaurantId().equals(restaurant.getRestaurantId())) {
            throw new AccessDeniedException("You are not allowed to perform this action of updating Addons for this restaurant.");
        }

        return addon;
    }
}
