package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class ConstructionTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -4320730644195289075L;
    private String id;
    private String type;
}