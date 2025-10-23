package edu.hcmute.dto;

import lombok.Data;

@Data
public class PropertyInfoDto {
    private String id;
    private String squareMeters;
    private int yearBuilt;
    private int noFloors;
    private String appraisedValue;
    private String replacementCost;
    private String marketValue;

    private PropertyTypeDto propertyTypeDto;
    private PropertyAddressDto propertyAddressDto;
    private ConstructionTypeDto constructionTypeDto;
    private OccupancyTypeDto occupancyTypeDto;
}