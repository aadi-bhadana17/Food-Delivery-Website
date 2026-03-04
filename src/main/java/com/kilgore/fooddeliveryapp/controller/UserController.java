package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.request.AddressRequest;
import com.kilgore.fooddeliveryapp.dto.request.RoleChangeRequestDto;
import com.kilgore.fooddeliveryapp.dto.request.UpdateProfileRequest;
import com.kilgore.fooddeliveryapp.dto.response.AddressResponse;
import com.kilgore.fooddeliveryapp.dto.response.ProfileResponse;
import com.kilgore.fooddeliveryapp.dto.response.RestaurantResponse;
import com.kilgore.fooddeliveryapp.dto.response.RoleChangeRequestResponse;
import com.kilgore.fooddeliveryapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ProfileResponse getProfile() {
        return userService.getProfile();
    }

    @PutMapping("/profile")
    public ProfileResponse updateProfile(@RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(request);
    }

    @GetMapping("/addresses")
    public List<AddressResponse> getAddresses() {
        return userService.getAddresses();
    }

    @PostMapping("/addresses")
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse addAddress(@RequestBody AddressRequest request) {
        return userService.addAddress(request);
    }

    @PutMapping("/addresses/{id}")
    public AddressResponse updateAddress(@PathVariable Long id, @RequestBody AddressRequest request) {
        return userService.updateAddress(id, request);
    }

    @DeleteMapping("/addresses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(@PathVariable Long id) {
        userService.deleteAddress(id);
    }

    @PutMapping("/addresses/{id}/default")
    public AddressResponse setDefaultAddress(@PathVariable Long id) {
        return userService.setDefaultAddress(id);
    }

    @GetMapping("/favourites")
    public List<RestaurantResponse> getFavourites() {
        return userService.getFavourites();
    }

    @PostMapping("/favourites/{restaurantId}")
    public List<RestaurantResponse> addFavourite(@PathVariable Long restaurantId) {
        return userService.addFavourite(restaurantId);
    }

    @DeleteMapping("/favourites/{restaurantId}")
    public List<RestaurantResponse> removeFavourite(@PathVariable Long restaurantId) {
        return userService.removeFavourite(restaurantId);
    }

    @PostMapping("/role-change-request")
    public RoleChangeRequestResponse roleChangeRequest(@RequestBody RoleChangeRequestDto request) {
        return userService.createRoleChangeRequest(request);
    }
}

