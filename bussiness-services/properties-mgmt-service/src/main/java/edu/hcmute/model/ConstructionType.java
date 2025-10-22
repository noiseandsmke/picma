package edu.hcmute.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serial;
import java.io.Serializable;

@Document(collection = "${properties.management.collection.name}")
@Data
public class ConstructionType implements Serializable {
    @Serial
    private static final long serialVersionUID = 2720368548116058327L;
    @Id
    private String id;
    @Indexed(unique = true)
    private String type;
}