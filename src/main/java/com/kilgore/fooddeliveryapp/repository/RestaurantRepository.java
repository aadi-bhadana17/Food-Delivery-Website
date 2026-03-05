package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Restaurant findRestaurantByRestaurantNameAndAddress_City(String name, String city);

    Optional<Object> findRestaurantByRestaurantName(String name);
}
