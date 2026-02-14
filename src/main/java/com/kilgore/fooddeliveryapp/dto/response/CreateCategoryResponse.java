package com.kilgore.fooddeliveryapp.dto.response;

import com.kilgore.fooddeliveryapp.dto.summary.RestaurantSummary;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateCategoryResponse {
    private Long categoryId;
    private String categoryName;
    private String description;
    private RestaurantSummary restaurant;
    private Integer displayOrder;
}
