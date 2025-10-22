package edu.hcmute.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "${properties.management.collection.name}")
@Data
public class OccupancyType {
    @Id
    String id;
    @Indexed(unique = true)
    String type;
}