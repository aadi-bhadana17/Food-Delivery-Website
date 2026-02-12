package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.request.CreateAddonRequest;
import com.kilgore.fooddeliveryapp.dto.request.AddonAvailableStatusRequest;
import com.kilgore.fooddeliveryapp.dto.response.AddonResponse;
import com.kilgore.fooddeliveryapp.service.AddonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/ingredients")
@PreAuthorize("hasAnyAuthority('RESTAURANT_OWNER')")
public class AddonController {

    @Autowired
    private AddonService ingredientService;

    @PostMapping
    public AddonResponse createAddon(@PathVariable Long restaurantId,
                                               @RequestBody CreateAddonRequest request) {
        return ingredientService.createAddon(restaurantId, request);
    }

    @GetMapping
    public List<AddonResponse> getAddons(@PathVariable Long restaurantId) {
        return ingredientService.getAddons(restaurantId);
    }

    @PutMapping("/{ingredientId}")
    public AddonResponse updateAddon(@PathVariable Long restaurantId,
                                               @PathVariable Long ingredientId,
                                               @RequestBody CreateAddonRequest request) {
        return ingredientService.updateAddon(restaurantId, ingredientId, request);
    }

    @PatchMapping("/{ingredientId}")
    public AddonResponse updateAvailability(@PathVariable Long restaurantId,
                                                 @PathVariable Long ingredientId,
                                                 @RequestBody AddonAvailableStatusRequest request) {
        return ingredientService.updateAvailability(restaurantId, ingredientId, request);
    }

    @DeleteMapping("/{ingredientId}")
    public String deleteAddon(@PathVariable Long restaurantId,
                                               @PathVariable Long ingredientId) {
        return ingredientService.deleteAddon(restaurantId, ingredientId);
    }
}
