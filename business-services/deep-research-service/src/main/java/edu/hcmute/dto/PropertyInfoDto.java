package edu.hcmute.dto;

public record PropertyInfoDto(
        String id,
        String userId,
        LocationDto location,
        AttributesDto attributes,
        ValuationDto valuation
) {
}