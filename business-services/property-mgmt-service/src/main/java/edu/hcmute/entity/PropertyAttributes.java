package edu.hcmute.entity;

import edu.hcmute.domain.ConstructionType;
import edu.hcmute.domain.OccupancyType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyAttributes {
    private ConstructionType constructionType;
    private OccupancyType occupancyType;
    private Integer yearBuilt;
    private Integer noFloors;
    private Double squareMeters;
}
