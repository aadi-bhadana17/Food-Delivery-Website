package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem,Long> {
}
