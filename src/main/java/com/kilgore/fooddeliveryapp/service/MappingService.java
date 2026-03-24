package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.dto.summary.*;
import com.kilgore.fooddeliveryapp.model.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MappingService {

    public UserSummary toUserSummary(User user) {
        return new UserSummary(
                user.getUserId(),
                user.getFirstName() + " " + user.getLastName()
        );
    }

    public RestaurantSummary toRestaurantSummary(Restaurant restaurant) {
        return new RestaurantSummary(
                restaurant.getRestaurantId(),
                restaurant.getRestaurantName(),
                restaurant.getCuisineType(),
                restaurant.getAvgRating()
        );
    }

    public CartSummary toCartSummary(Cart cart) {
        return new CartSummary(
                cart.getCartId(),
                createCartItemSummaries(cart.getItems()),
                cart.getTotalPrice()
        );
    }

    public List<CartItemSummary> createCartItemSummaries(List<CartItem> items) {
        return items.stream().map(this::toCartItemSummary).toList();
    }

    public CartItemSummary toCartItemSummary(CartItem item) {
        return new CartItemSummary(
                item.getCartItemId(),
                item.getFood().getFoodId(),
                item.getFood().getFoodName(),
                item.getQuantity(),
                createAddonSummaries(item.getAddons()),
                item.getItemTotal()
        );
    }

    public List<AddonSummary> createAddonSummaries(List<Addon> addons) {
        return addons.stream().map(this::toAddonSummary).toList();
    }

    public AddonSummary toAddonSummary(Addon addon) {
        return new AddonSummary(
                addon.getAddonId(),
                addon.getAddonName()
        );
    }

    public List<SharedCartMemberSummary> createSharedCartMemberSummaries(List<SharedCartMember> members) {
        return members.stream().map(this::toSharedCartMemberSummary).toList();
    }

    public SharedCartMemberSummary toSharedCartMemberSummary(SharedCartMember member) {
        return new SharedCartMemberSummary(
                member.getMemberId(),
                toUserSummary(member.getUser()),
                toCartSummary(member.getCart()),
                member.getWalletContribution()
        );
    }
}
