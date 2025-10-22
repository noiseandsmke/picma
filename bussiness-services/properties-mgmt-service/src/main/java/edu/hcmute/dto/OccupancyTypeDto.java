package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class OccupancyTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 4514165369996110414L;
    private String id;
    private String type;
}