package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.publicResponse.RestaurantMenuResponse;
import com.kilgore.fooddeliveryapp.dto.publicResponse.RestaurantPublicResponse;
import com.kilgore.fooddeliveryapp.service.PublicService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public")
public class PublicController {
    /*
        This controller can be used for endpoints that do not require authentication, such as viewing the menu
        or available restaurants.
        Also, it will be used to land users after login, and to provide access to the home page and other public resources.
    */

    private final PublicService publicService;

    public PublicController(PublicService publicService) {
        this.publicService = publicService;
    }

    @GetMapping("/restaurants")
    public List<RestaurantPublicResponse> getRestaurants(
                                    @RequestParam(required = false) String city,
                                    @RequestParam(required = false) String cuisineType,
                                    @RequestParam(required = false) Boolean isOpen) {

        return publicService.getRestaurants(city, cuisineType, isOpen);
    }

    @GetMapping("/restaurants/search")
    public List<RestaurantPublicResponse> getRestaurantByName(@RequestParam("q") String name) {
        return publicService.getRestaurantByName(name);
    }

    @GetMapping("/restaurants/{id}")
    public RestaurantPublicResponse getRestaurantById(@PathVariable Long id) {
        return publicService.getRestaurantById(id);
    }

    @GetMapping("/restaurants/{id}/menu")
    public RestaurantMenuResponse getRestaurantMenu(@PathVariable Long id) {
        return publicService.getRestaurantMenu(id);
    }
}
