package edu.hcmute.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "property_management")
@TypeAlias("PropertyInfo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyInfo {
    @Id
    private String id;
    private String userId;
    private PropertyLocation location;
    private PropertyAttributes attributes;
    private PropertyValuation valuation;
}