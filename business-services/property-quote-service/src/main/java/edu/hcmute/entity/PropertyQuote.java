package edu.hcmute.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PropertyQuote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_info_id")
    private PropertyInfo propertyInfo;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_type_id")
    private QuoteType quoteType;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coverage_type_id")
    private CoverageType coverageType;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_type_id")
    private PolicyType policyType;
}