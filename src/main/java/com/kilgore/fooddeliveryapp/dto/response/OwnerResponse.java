package com.kilgore.fooddeliveryapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OwnerResponse {
    private Long userId;
    private String ownerName;
    private String email;
}
