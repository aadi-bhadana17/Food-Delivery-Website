package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.request.AddToCartRequest;
import com.kilgore.fooddeliveryapp.dto.response.CartResponse;
import com.kilgore.fooddeliveryapp.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping()
    public CartResponse addToCart(@RequestBody AddToCartRequest request) {
        return cartService.addToCart(request);
    }

    @GetMapping()
    public CartResponse getCart() {
        return cartService.getCart();
    }
}
