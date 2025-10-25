package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class OccupancyTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 5820454209808827381L;
    private String type;
}