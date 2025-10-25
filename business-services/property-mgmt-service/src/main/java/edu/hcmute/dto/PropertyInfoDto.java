package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PropertyInfoDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 1672407617888964965L;
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