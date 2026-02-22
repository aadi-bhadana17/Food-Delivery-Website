package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
