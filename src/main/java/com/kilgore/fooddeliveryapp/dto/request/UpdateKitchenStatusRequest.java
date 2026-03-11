package com.kilgore.fooddeliveryapp.dto.request;

import com.kilgore.fooddeliveryapp.model.KitchenLoadIndicator;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateKitchenStatusRequest {
    @NotNull
    private KitchenLoadIndicator kitchenLoadIndicator;
}
