package edu.hcmute.dto;

public record PropertyInfoDto(
        String id,
        String userId,
        PropertyLocationDto location,
        PropertyAttributesDto attributes,
        PropertyValuationDto valuation
) {
}