package com.kilgore.fooddeliveryapp.model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ingredientId;

    private String ingredientName;

    @ManyToOne
    private Restaurant restaurant;

    private String ingredientCategory;

    private boolean available;
}