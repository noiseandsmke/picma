package edu.hcmute.entity;

import edu.hcmute.domain.ConstructionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyAttributes {
    private ConstructionType constructionType;

    private int yearBuilt;
    private int noFloors;
    private double squareMeters;
}