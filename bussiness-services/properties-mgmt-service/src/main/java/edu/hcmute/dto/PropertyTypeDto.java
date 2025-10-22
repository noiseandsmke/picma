package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PropertyTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 57554421340498067L;
    private String id;
    private String type;
}