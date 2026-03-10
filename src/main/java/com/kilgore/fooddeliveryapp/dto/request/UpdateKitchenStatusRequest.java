package com.kilgore.fooddeliveryapp.dto.request;

import com.kilgore.fooddeliveryapp.model.KitchenLoadIndicator;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateKitchenStatusRequest {
    private KitchenLoadIndicator kitchenLoadIndicator;
}
