package edu.hcmute.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PropertyLeadDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    private PropertyLead propertyLead;

    @ManyToOne(fetch = FetchType.LAZY)
    private PropertyQuote propertyQuote;
}