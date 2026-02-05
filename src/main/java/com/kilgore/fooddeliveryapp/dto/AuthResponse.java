package com.kilgore.fooddeliveryapp.dto;

import com.kilgore.fooddeliveryapp.model.USER_ROLE;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private USER_ROLE role;
    private long expiresAt;
}
