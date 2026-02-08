package com.kilgore.fooddeliveryapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long restaurantId;
    private String restaurantName;

    @ManyToOne(cascade = CascadeType.PERSIST)
    private User owner;

    private String restaurantDescription;

    @Enumerated(EnumType.STRING)
    private CuisineType cuisineType;

    @Embedded
    private RestaurantAddress address;

    @Embedded
    private ContactInformation contactInformation;

    private LocalTime openingTime;
    private LocalTime closingTime;

    @OneToMany(mappedBy = "restaurant")
    private List<Review> reviews;

    @OneToMany(mappedBy = "restaurant")
    private List<Order> orders;

    @Column(length = 1000)
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> images;

    private LocalDate registrationDate;
    private boolean open;

    @JsonIgnore
    @ManyToMany(cascade = CascadeType.PERSIST)
    private List<Food> foods;
}
