package com.kilgore.fooddeliveryapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Food {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long foodId;
    private String foodName;
    private String foodDescription;
    private BigDecimal foodPrice;

    @ManyToOne
    private Category foodCategory;

    @Column(length = 1000)
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> images;

    private boolean available;

    @ManyToOne
    private Restaurant restaurant;

    private boolean vegetarian;
    private boolean seasonal;

    @ManyToMany
    private List<Ingredients> ingredients;
    private LocalDateTime createdAt;

}
/*
* public class Food {
    id;
    name;
    description;
    price;
    foodCategory;
    images;
    available;
    restaurant;
    isVegetarian;
    isSeasonal;
    ingredients;
    creationDate;
}*/