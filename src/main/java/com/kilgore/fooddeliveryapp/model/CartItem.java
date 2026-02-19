package com.kilgore.fooddeliveryapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int cartItemId;

    @ManyToOne
    @JsonIgnore
    private Cart cart;

    @ManyToOne
    private Food food;

    private int quantity;
    private BigDecimal priceAtAddition;
    @OneToMany
    private List<Addon> addons;
    private BigDecimal itemTotal;

    private LocalDateTime addedTime;

}
/*
* public class CartItem {
    id;
    cart;
    food;
    quantity;
    ingredients;
    totalPrice;
}*/