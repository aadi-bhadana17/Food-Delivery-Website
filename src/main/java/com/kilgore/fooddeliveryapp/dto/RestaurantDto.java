package com.kilgore.fooddeliveryapp.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.util.List;


@Data
@Embeddable
public class RestaurantDto {

    private Long restaurantId;
    private String restaurantName;
    private String restaurantDescription;

    @Column(length = 1000)
    private List<String> images;

}