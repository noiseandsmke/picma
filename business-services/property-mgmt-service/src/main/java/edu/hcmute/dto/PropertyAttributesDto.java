package edu.hcmute.dto;

import edu.hcmute.domain.ConstructionType;

public record PropertyAttributesDto(
        ConstructionType constructionType,
        int yearBuilt,
        int noFloors,
        double squareMeters
) {
}
