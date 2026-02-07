package com.kilgore.fooddeliveryapp.dto.request;

import com.kilgore.fooddeliveryapp.model.USER_ROLE;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleChangeRequestDto {
    private USER_ROLE requestedRole;
    private String requestReason;
}
