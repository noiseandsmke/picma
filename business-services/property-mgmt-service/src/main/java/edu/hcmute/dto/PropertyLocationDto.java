package edu.hcmute.dto;

public record PropertyLocationDto(
        String street,
        String ward,
        String city,
        String zipCode
) {
}