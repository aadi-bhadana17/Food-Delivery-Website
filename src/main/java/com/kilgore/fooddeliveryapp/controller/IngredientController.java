package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.request.CreateIngredientRequest;
import com.kilgore.fooddeliveryapp.dto.request.IngredientAvailableStatusRequest;
import com.kilgore.fooddeliveryapp.dto.response.IngredientResponse;
import com.kilgore.fooddeliveryapp.service.IngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/ingredients")
@PreAuthorize("hasAnyAuthority('RESTAURANT_OWNER')")
public class IngredientController {

    @Autowired
    private IngredientService ingredientService;

    @PostMapping
    public IngredientResponse createIngredient(@PathVariable Long restaurantId,
                                               @RequestBody CreateIngredientRequest request) {
        return ingredientService.createIngredient(restaurantId, request);
    }

    @GetMapping
    public List<IngredientResponse> getIngredients(@PathVariable Long restaurantId) {
        return ingredientService.getIngredients(restaurantId);
    }

    @PutMapping("/{ingredientId}")
    public IngredientResponse updateIngredient(@PathVariable Long restaurantId,
                                               @PathVariable Long ingredientId,
                                               @RequestBody CreateIngredientRequest request) {
        return ingredientService.updateIngredient(restaurantId, ingredientId, request);
    }

    @PatchMapping("/{ingredientId}")
    public IngredientResponse updateAvailability(@PathVariable Long restaurantId,
                                                 @PathVariable Long ingredientId,
                                                 @RequestBody IngredientAvailableStatusRequest request) {
        return ingredientService.updateAvailability(restaurantId, ingredientId, request);
    }

    @DeleteMapping("/{ingredientId}")
    public String deleteIngredient(@PathVariable Long restaurantId,
                                               @PathVariable Long ingredientId) {
        return ingredientService.deleteIngredient(restaurantId, ingredientId);
    }
}
