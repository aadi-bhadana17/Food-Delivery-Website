package com.kilgore.fooddeliveryapp.dto.summary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemSummary {

    private Long orderItemId;
    private Long foodId;
    private String foodName;

    private int quantity;
    private BigDecimal priceAtOrder;
    private List<AddonSummary> addons;
    private BigDecimal itemTotal;
}
