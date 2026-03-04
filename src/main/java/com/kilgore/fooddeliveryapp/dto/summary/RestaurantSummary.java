package com.kilgore.fooddeliveryapp.dto.summary;

import com.kilgore.fooddeliveryapp.model.CuisineType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantSummary {
    private Long restaurantId;
    private String restaurantName;
    private CuisineType cuisineType;
    private BigDecimal avgRating;
}
