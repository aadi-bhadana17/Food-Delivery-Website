package com.kilgore.fooddeliveryapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;

    @ManyToOne
    private User customer;

    @OneToMany(mappedBy = "cart",  cascade = CascadeType.ALL,  fetch = FetchType.EAGER, orphanRemoval = true)
    private List<CartItem> items;
    private int totalQuantity;

}
/*
* public class Cart {
    id;
    customer;
    items;
    total;
}*/