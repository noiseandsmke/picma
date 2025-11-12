package edu.hcmute.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

import java.io.Serial;
import java.io.Serializable;

@Entity
@Table(name = "revinfo")
@RevisionEntity
@Data
public class RevisionInfo implements Serializable {
    @Serial
    private static final long serialVersionUID = -5128056720901410001L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @RevisionNumber
    @Column(name = "rev")
    private Integer rev;

    @RevisionTimestamp
    @Column(name = "revtstmp")
    private Long revisionTimestamp;
}