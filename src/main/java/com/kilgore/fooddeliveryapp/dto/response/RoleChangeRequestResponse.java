package com.kilgore.fooddeliveryapp.dto.response;

import com.kilgore.fooddeliveryapp.model.REQUEST_STATUS;
import com.kilgore.fooddeliveryapp.model.USER_ROLE;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleChangeRequestResponse {

    private Long requestId;
    private String userName;
    private String userEmail;
    private USER_ROLE requestedRole;
    private REQUEST_STATUS requestStatus;

    private String requestReason;

    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;

    private String adminName;
    private String adminEmail;

}
