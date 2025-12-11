package edu.hcmute.dto;

public record PropertyAttributesDto(
        ConstructionType constructionType,
        OccupancyType occupancyType,
        Integer yearBuilt,
        Integer noFloors,
        Double squareMeters
) {
    enum ConstructionType {
        CONCRETE,
        STEEL_FRAME,
        MASONRY,
        WOOD_FRAME
    }

    enum OccupancyType {
        RESIDENTIAL,
        COMMERCIAL,
        INDUSTRIAL,
        MIXED_USE
    }
}