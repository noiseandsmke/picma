package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PropertyTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -4212736297242755179L;
    private String type;
}