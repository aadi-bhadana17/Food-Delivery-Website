package com.kilgore.fooddeliveryapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantSummary {
    private Long restaurantId;
    private String restaurantName;
}
