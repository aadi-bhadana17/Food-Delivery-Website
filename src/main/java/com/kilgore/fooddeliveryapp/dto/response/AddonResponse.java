package com.kilgore.fooddeliveryapp.dto.response;

import com.kilgore.fooddeliveryapp.dto.summary.CategorySummary;
import com.kilgore.fooddeliveryapp.dto.summary.RestaurantSummary;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddonResponse {
    private Long addonId;
    private String addonName;
    private List<CategorySummary> categories;
    private RestaurantSummary restaurant;
    private boolean available;
}
