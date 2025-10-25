package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class ConstructionTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -8844534937572245594L;
    private String type;
}