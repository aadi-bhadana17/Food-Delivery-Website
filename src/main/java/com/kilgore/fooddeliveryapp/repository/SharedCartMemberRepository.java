package com.kilgore.fooddeliveryapp.repository;

import com.kilgore.fooddeliveryapp.model.SharedCartMember;
import com.kilgore.fooddeliveryapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SharedCartMemberRepository extends JpaRepository<SharedCartMember, Long> {

    @Query("SELECT mem FROM SharedCartMember mem " +
            "WHERE mem.sharedCart.joinCode = :joinCode " +
            "AND mem.user = :user " +
            "AND mem.isActive = true")
    SharedCartMember findByUserAndJoinCode(@Param("joinCode") String joinCode, @Param("user") User user);

    @Query("SELECT mem FROM SharedCartMember mem " +
            "WHERE mem.user.userId = :userId " +
            "AND mem.isActive = true")
    SharedCartMember findActiveMemberByUserId(@Param("userId") Long userId);

}


