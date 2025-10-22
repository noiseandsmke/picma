package edu.hcmute.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serial;
import java.io.Serializable;

@Document(collection = "properties-management")
@Data
public class PropertyType implements Serializable {
    @Serial
    private static final long serialVersionUID = -3253022478967494885L;
    @Id
    private String id;
    @Indexed(unique = true)
    private String type;
}