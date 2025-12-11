package edu.hcmute.dto;

public record PropertyInfoDto(
        String id,
        String userId,
        PropertyLocationDto location,
        PropertyAttributesDto attributes,
        PropertyValuationDto valuation
) {
    public String address() {
        return location != null ? location.street() + ", " + location.ward() + ", " + location.city() : "Unknown Address";
    }
}