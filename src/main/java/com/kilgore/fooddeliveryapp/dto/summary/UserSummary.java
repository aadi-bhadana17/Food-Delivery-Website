package com.kilgore.fooddeliveryapp.dto.summary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSummary {

    private Long userId;
    private String userName;
}
