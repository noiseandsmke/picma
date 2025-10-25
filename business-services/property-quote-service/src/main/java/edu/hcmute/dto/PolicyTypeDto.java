package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PolicyTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -7366251183488376393L;
    private Integer id;
    private String type;
    private CoverageTypeDto coverageTypeDto;
}