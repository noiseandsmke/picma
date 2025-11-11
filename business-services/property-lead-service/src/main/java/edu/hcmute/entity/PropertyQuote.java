package edu.hcmute.entity;

import edu.hcmute.audit.Auditable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.AuditTable;
import org.hibernate.envers.Audited;

import java.io.Serial;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@Audited
@AuditTable(value = "AU_PROPERTY_QUOTE")
public class PropertyQuote extends Auditable {
    @Serial
    private static final long serialVersionUID = 8190387722804246301L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String userInfo;
    private String propertyInfo;
}