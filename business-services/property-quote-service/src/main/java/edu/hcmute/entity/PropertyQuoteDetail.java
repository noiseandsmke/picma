package edu.hcmute.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PropertyQuoteDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY)

    @JoinColumn
    private PropertyQuote propertyQuote;

    @ManyToOne(fetch = FetchType.LAZY)
    private QuoteType quoteType;

    @ManyToOne(fetch = FetchType.LAZY)
    private CoverageType coverageType;

    @ManyToOne(fetch = FetchType.LAZY)
    private PolicyType policyType;
}