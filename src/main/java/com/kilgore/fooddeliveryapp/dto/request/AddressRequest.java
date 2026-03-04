package com.kilgore.fooddeliveryapp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressRequest {
    private String buildingNo;
    private String street;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
}
