package edu.hcmute.dto;

import lombok.Data;

@Data
public class PropertyAddressDto {
    private String id;
    private String zipCode;
    private String street;
    private String state;
    private String city;
    private String country;
}