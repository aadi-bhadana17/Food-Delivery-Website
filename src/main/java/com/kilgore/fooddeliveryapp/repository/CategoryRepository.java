package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

}
