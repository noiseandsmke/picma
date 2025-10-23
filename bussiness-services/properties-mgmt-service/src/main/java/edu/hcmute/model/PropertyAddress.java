package edu.hcmute.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "${properties.management.collection.name}")
@Data
public class PropertyAddress {
    @Id
    private String id;
    private String zipCode;
    private String street;
    private String state;
    private String city;
    private String country;
}