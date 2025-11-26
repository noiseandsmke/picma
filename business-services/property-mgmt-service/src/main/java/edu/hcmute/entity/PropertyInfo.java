package edu.hcmute.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "${properties.management.collection.name}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyInfo {
    @Id
    private String id;
    private PropertyLocation location;
    private PropertyAttributes attributes;
    private PropertyValuation valuation;
}
