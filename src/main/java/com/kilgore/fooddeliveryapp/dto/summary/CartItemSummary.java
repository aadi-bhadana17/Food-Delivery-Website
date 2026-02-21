package com.kilgore.fooddeliveryapp.dto.summary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemSummary {
    private Long cartItemId;
    private Long foodId;
    private String foodName;

    private int quantity;
    private List<AddonSummary> addons;
    private BigDecimal itemTotal;
}
