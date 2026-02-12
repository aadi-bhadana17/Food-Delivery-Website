package com.kilgore.fooddeliveryapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Addon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addonId;

    private String addonName;

    @ManyToOne
    private Restaurant restaurant;

    private String category;
    private BigDecimal price;
    private boolean available;
}