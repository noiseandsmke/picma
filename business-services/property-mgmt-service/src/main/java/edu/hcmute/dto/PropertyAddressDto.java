package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PropertyAddressDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -8923950198620512276L;
    private String zipCode;
    private String street;
    private String state;
    private String city;
    private String country;
}