package com.kilgore.fooddeliveryapp.dto.request;

import com.kilgore.fooddeliveryapp.model.CuisineType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantRequest {

    @NotBlank
    private String restaurantName;
    @NotBlank
    private String restaurantDescription;
    @NotNull
    private CuisineType cuisineType;
    @NotNull
    @Valid
    private RestaurantAddressDto address;
    @NotNull
    @Valid
    private ContactInformationDto contactInformation;
    @NotNull
    private LocalTime openingTime;
    @NotNull
    private LocalTime closingTime;
}
