package com.kilgore.fooddeliveryapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IngredientResponse {
    private Long ingredientId;
    private String ingredientName;
    private String ingredientCategory;
    private RestaurantSummary restaurant;
    private boolean available;
}
