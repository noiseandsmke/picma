package edu.hcmute.model;

import lombok.Data;

@Data
public class PropertyAddress {
    private String zipCode;
    private String street;
    private String state;
    private String city;
    private String country;
}