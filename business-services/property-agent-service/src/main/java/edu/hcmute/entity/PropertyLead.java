package edu.hcmute.entity;

import edu.hcmute.audit.Auditable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
public class PropertyLead extends Auditable {
    @Serial
    private static final long serialVersionUID = 1882655791243973874L;
    private Integer id;
    private String userInfo;
    private String propertyInfo;
    private String status;
    private LocalDate startDate;
    private LocalDate expiryDate;
}