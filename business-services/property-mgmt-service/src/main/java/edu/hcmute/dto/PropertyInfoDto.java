package edu.hcmute.dto;

public record PropertyInfoDto(
        String id,
        String squareMeters,
        int yearBuilt,
        int noFloors,
        String appraisedValue,
        String replacementCost,
        String marketValue,
        PropertyTypeDto propertyTypeDto,
        PropertyAddressDto propertyAddressDto,
        ConstructionTypeDto constructionTypeDto,
        OccupancyTypeDto occupancyTypeDto
) {
}