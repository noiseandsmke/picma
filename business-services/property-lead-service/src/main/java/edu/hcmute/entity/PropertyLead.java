package edu.hcmute.entity;

import edu.hcmute.audit.Auditable;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.AuditTable;
import org.hibernate.envers.Audited;

import java.io.Serial;
import java.time.LocalDate;

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

    @Temporal(TemporalType.DATE)
    private LocalDate startDate;
    @Temporal(TemporalType.DATE)
    private LocalDate expiryDate;
}