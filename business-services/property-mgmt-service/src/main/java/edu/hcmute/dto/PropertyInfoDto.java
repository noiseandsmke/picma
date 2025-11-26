package edu.hcmute.dto;

public record PropertyInfoDto(
        String id,
        PropertyLocationDto location,
        PropertyAttributesDto attributes,
        PropertyValuationDto valuation
) {
}
