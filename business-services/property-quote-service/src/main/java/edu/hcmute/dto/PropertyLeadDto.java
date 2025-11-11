package edu.hcmute.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

@Data
@Builder
public class PropertyLeadDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -1738411917471044843L;
    private Integer id;
    private String userInfo;
    private String propertyInfo;
    private String status;
    private Instant startDate;
    private Instant expiryDate;
}