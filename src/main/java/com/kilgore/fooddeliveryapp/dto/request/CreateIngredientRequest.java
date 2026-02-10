package com.kilgore.fooddeliveryapp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateIngredientRequest {

    private String ingredientName;
    private String ingredientCategory;
    private boolean available;
}
