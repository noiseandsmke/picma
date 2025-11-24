package edu.hcmute.dto;

public record PropertyAddressDto(
        String zipCode,
        String street,
        String state,
        String city,
        String country
) {
}