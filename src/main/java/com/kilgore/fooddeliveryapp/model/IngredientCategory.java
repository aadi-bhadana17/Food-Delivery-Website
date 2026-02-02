package com.kilgore.fooddeliveryapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ingredientCategoryId;

    private String categoryName;
    @JsonIgnore
    @ManyToOne
    private Restaurant restaurant;

    @OneToMany(mappedBy = "ingredientCategory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ingredients> ingredients;
}
/*
* public class IngredientCategory {
    id;
    name;
    restaurant;
    ingredients;
}*/