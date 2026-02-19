package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.model.Addon;
import com.kilgore.fooddeliveryapp.model.Cart;
import com.kilgore.fooddeliveryapp.model.CartItem;
import com.kilgore.fooddeliveryapp.model.Food;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PricingService {

    public BigDecimal calculateItemTotal(CartItem item) {
        BigDecimal base = item.getFood().getFoodPrice();

        BigDecimal addonTotal = item.getAddons().stream()
                .map(Addon::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return base.add(addonTotal)
                .multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    public BigDecimal calculatePriceAtAddition(CartItem item) {
        BigDecimal base = item.getFood().getFoodPrice();

        BigDecimal addonTotal = item.getAddons().stream()
                .map(Addon::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return base.add(addonTotal);
    }

    public BigDecimal calculateCartTotal(Cart cart) {
        return cart.getItems().stream()
                .map(CartItem::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateCurrentPrice(Food food, List<Addon> addons) {
        BigDecimal base = food.getFoodPrice();

        BigDecimal addonTotal = addons.stream()
                .map(Addon::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return base.add(addonTotal);
    }
}
