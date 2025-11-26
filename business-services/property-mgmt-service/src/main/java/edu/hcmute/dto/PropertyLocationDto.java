package edu.hcmute.dto;

public record PropertyLocationDto(
        String fullAddress,
        String ward,
        String city,
        String zipCode
) {
}
