package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Cart;
import com.kilgore.fooddeliveryapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {

    @Query("SELECT c FROM Cart c WHERE c.user = :user AND c.sharedCart IS NULL")
    Cart findByUser(@Param("user") User user);
}
