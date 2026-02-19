package com.kilgore.fooddeliveryapp.dto.response;

import com.kilgore.fooddeliveryapp.dto.summary.CartItemSummary;
import com.kilgore.fooddeliveryapp.dto.summary.RestaurantSummary;
import com.kilgore.fooddeliveryapp.dto.summary.UserSummary;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long cartId;
    private UserSummary user;
    private List<CartItemSummary> cartItems;
    private int totalQuantity;
    private BigDecimal totalPrice;
    private RestaurantSummary restaurant;
    private String message;
}
