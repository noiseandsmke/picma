package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class QuoteTypeDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 5364441912345796914L;
    private Integer id;
    private String type;
}