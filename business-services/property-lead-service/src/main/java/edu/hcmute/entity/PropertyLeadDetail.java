package edu.hcmute.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table
public class PropertyLeadDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private PropertyLead propertyLead;

    @ManyToOne
    private PropertyQuote propertyQuote;
}