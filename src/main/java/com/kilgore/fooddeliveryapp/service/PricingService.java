package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.model.Addon;
import com.kilgore.fooddeliveryapp.model.Cart;
import com.kilgore.fooddeliveryapp.model.CartItem;
import com.kilgore.fooddeliveryapp.model.Food;
import com.kilgore.fooddeliveryapp.repository.CartItemRepository;
import com.kilgore.fooddeliveryapp.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PricingService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public PricingService(CartRepository cartRepository, CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

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

    public void updateCartTotal(Cart cart) {
        cart.setTotalPrice(calculateCartTotal(cart));
        cart.setTotalQuantity(calculateTotalQuantity(cart));
        cartRepository.save(cart);
    }

    public boolean refreshExpiredPrices(Cart cart) {
        boolean anyPriceUpdated = false;

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);

        for(CartItem item : cart.getItems()){
            if(item.getAddedTime().isBefore(oneHourAgo)){
                BigDecimal newPrice = calculateCurrentPrice(
                        item.getFood(),
                        item.getAddons());

                if(!item.getPriceAtAddition().equals(newPrice)){
                    item.setPriceAtAddition(newPrice);
                    item.setItemTotal(newPrice.multiply
                            (BigDecimal.valueOf(item.getQuantity())));
                    item.setAddedTime(LocalDateTime.now());
                    anyPriceUpdated = true;

                    cartItemRepository.save(item);
                }
            }
        }
        return anyPriceUpdated;
    }

    private int calculateTotalQuantity(Cart  cart) {
        return cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }
}
