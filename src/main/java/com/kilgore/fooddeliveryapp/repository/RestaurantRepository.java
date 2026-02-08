package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    public Restaurant findRestaurantByRestaurantNameAndAddress_City(String name, String city);
}
