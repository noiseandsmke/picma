package edu.hcmute.entity;

import edu.hcmute.domain.CoverageCode;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteCoverage {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CoverageCode code;
    @Column(nullable = false)
    private Long coverageLimit;
    @Column(nullable = false)
    private Double deductible;
}