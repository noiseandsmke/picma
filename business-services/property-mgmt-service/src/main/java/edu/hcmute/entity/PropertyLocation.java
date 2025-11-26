package edu.hcmute.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyLocation {
    private String fullAddress;
    private String ward;
    private String city;
    private String zipCode;
}
