package edu.hcmute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyLeadDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -1738411917471044843L;
    private Integer id;
    private String userInfo;
    private String propertyInfo;
    private String status;
    private LocalDate startDate;
    private LocalDate expiryDate;
}