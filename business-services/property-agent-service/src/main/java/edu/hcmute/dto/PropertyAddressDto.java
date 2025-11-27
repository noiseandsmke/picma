package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PropertyAddressDto(
        String zipCode
) {
}