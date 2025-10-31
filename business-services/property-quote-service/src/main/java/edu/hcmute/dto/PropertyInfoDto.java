package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PropertyInfoDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 3551191619451907355L;
    private Integer id;
    private String userInfo;
    private String propertyInfo;
}