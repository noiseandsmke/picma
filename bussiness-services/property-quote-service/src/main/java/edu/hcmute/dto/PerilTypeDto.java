package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PerilTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 3330899867043213948L;
    private Integer id;
    private String type;
}