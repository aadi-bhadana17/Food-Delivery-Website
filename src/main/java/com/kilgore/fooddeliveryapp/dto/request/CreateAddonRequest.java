package com.kilgore.fooddeliveryapp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateAddonRequest {

    private String addonName;
    private String category;
    private boolean available;
}
