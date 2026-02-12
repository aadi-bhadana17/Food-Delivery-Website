package com.kilgore.fooddeliveryapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddonResponse {
    private Long addonId;
    private String addonName;
    private String category;
    private RestaurantSummary restaurant;
    private boolean available;
}
