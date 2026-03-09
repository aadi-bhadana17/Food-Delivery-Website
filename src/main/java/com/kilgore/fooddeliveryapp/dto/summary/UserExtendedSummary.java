package com.kilgore.fooddeliveryapp.dto.summary;

import com.kilgore.fooddeliveryapp.model.AccountStatus;
import com.kilgore.fooddeliveryapp.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserExtendedSummary {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private AccountStatus status;
    private boolean isOnline;
    private LocalDateTime restrictedUntil;
    private String restrictionReason;
    private List<RestaurantSummary> ownedRestaurants;

}
