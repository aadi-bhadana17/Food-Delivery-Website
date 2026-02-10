package com.kilgore.fooddeliveryapp.annotations;


import com.kilgore.fooddeliveryapp.dto.request.RestaurantRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RestaurantTimeValidator
        implements ConstraintValidator<RestaurantRequest.ValidRestaurantTime, RestaurantRequest> {

    @Override
    public boolean isValid(RestaurantRequest req, ConstraintValidatorContext ctx) {
        if (req.getOpeningTime() == null || req.getClosingTime() == null) {
            return true; // let @NotNull handle it
        }
        return req.getOpeningTime().isBefore(req.getClosingTime());
    }
}

