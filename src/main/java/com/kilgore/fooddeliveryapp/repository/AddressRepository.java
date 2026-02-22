package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address,Long> {
}
