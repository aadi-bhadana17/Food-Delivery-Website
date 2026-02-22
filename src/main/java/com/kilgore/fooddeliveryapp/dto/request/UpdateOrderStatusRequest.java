package com.kilgore.fooddeliveryapp.dto.request;

import com.kilgore.fooddeliveryapp.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateOrderStatusRequest {
    private OrderStatus orderStatus;
}
