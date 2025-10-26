package edu.hcmute.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "${properties.management.collection.name}")
@Data
public class PropertyInfo {
    @Id
    private String id;
    private String squareMeters;
    private int yearBuilt;
    private int noFloors;
    private String appraisedValue;
    private String replacementCost;
    private String marketValue;

    private PropertyType propertyType;
    private PropertyAddress propertyAddress;
    private ConstructionType constructionType;
    private OccupancyType occupancyType;
}