package edu.hcmute.dto;

public record AttributesDto(
        String constructionType,
        Integer yearBuilt,
        Integer noFloors,
        Integer squareMeters
) {
}