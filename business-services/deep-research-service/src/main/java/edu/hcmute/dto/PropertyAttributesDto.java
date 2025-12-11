package edu.hcmute.dto;

public record PropertyAttributesDto(
        ConstructionType constructionType,
        OccupancyType occupancyType,
        Integer yearBuilt,
        Integer noFloors,
        Double squareMeters
) {
    public enum ConstructionType {
        CONCRETE,
        STEEL_FRAME,
        MASONRY,
        WOOD_FRAME
    }

    public enum OccupancyType {
        RESIDENTIAL,
        COMMERCIAL,
        INDUSTRIAL,
        MIXED_USE
    }
}