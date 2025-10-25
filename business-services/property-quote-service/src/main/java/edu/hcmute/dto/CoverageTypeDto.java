package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class CoverageTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -1381495099874836953L;
    private Integer id;
    private String type;
    private List<PerilTypeDto> perilTypeList;
}