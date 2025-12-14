package edu.hcmute.dto;

public record PropertyAttributesDto(
        ConstructionType constructionType,
        Integer yearBuilt,
        Integer noFloors,
        Double squareMeters
) {
    public enum ConstructionType {
        WOOD,
        CONCRETE,
        HYBRID
    }
}