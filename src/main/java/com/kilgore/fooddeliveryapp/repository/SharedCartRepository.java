package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.SharedCart;
import com.kilgore.fooddeliveryapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SharedCartRepository extends JpaRepository<SharedCart,Long> {
    SharedCart findByHost(User user);

    SharedCart findByJoinCode(String joinCode);
}
