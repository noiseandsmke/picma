package edu.hcmute.audit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

@Data
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties(value = {"createdAt", "updatedAt", "createdBy", "modifiedBy"}, allowGetters = true)
public abstract class Auditable implements Serializable {
    @Serial
    private static final long serialVersionUID = -1711146978707808074L;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String modifiedBy;
}