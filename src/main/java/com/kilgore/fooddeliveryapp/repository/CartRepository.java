package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Cart;
import com.kilgore.fooddeliveryapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {

    Cart findByUser(User user);
}
