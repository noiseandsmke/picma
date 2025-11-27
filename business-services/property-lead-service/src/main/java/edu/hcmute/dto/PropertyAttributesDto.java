package edu.hcmute.dto;

import edu.hcmute.domain.ConstructionType;
import edu.hcmute.domain.OccupancyType;

public record PropertyAttributesDto(
        ConstructionType constructionType,
        OccupancyType occupancyType,
        Integer yearBuilt,
        Integer noFloors,
        Double squareMeters
) {
}