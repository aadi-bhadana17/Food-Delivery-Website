package com.kilgore.fooddeliveryapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemId;

    @ManyToOne
    private Food food;
    private int quantity;
    private BigDecimal priceAtOrder;
    private BigDecimal itemTotal;
    @OneToMany
    private List<Ingredients> ingredients;
}
/*
* public class OrderItem {
    id;
    food;
    quantity;
    totalPrice;
    ingredients;
}*/