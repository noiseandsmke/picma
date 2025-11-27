package edu.hcmute.entity;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PropertyLead {
    private Integer id;
    private String userInfo;
    private String propertyInfo;
    private String status;
    private LocalDate startDate;
    private LocalDate expiryDate;
}