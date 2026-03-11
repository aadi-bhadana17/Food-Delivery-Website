package com.kilgore.fooddeliveryapp.dto.response;

import com.kilgore.fooddeliveryapp.model.KitchenLoadIndicator;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KitchenLoadResponse {
    private Long restaurantId;
    private String restaurantName;
    private KitchenLoadIndicator kitchenLoadStatus;
    private int currentOrders;
    private String message;
}
