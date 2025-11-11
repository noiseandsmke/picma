package edu.hcmute.entity;

import edu.hcmute.audit.Auditable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import org.hibernate.envers.AuditTable;
import org.hibernate.envers.Audited;

import java.io.Serial;
import java.time.Instant;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Audited
@AuditTable(value = "AU_PROPERTY_LEAD")
public class PropertyLead extends Auditable {
    @Serial
    private static final long serialVersionUID = 3643158305653966965L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String userInfo;
    private String propertyInfo;
    private String status;
    private Instant startDate;
    private Instant expiryDate;
}