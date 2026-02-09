package com.kilgore.fooddeliveryapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"categoryName", "restaurant_id"})
})
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;
    private String categoryName;

    @ManyToOne
    @JsonIgnore
    private Restaurant restaurant;

    private String description;
    private Integer displayOrder;
}
/*
* public class Category {
    id;
    name;
    restaurant;
}*/
