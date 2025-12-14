package edu.hcmute.service;

import edu.hcmute.domain.CoverageCode;
import edu.hcmute.entity.Coverage;
import edu.hcmute.entity.Premium;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PremiumCalculationService {

    public Long calculateSumInsured(List<Coverage> coverages) {
        if (coverages == null || coverages.isEmpty()) {
            return 0L;
        }
        return coverages.stream()
                .mapToLong(c -> c.getCoverageLimit() != null ? c.getCoverageLimit() : 0L)
                .sum();
    }

    public Premium calculatePremium(List<Coverage> coverages) {
        if (coverages == null || coverages.isEmpty()) {
            return new Premium(0L, 0L, 0L);
        }
        long totalNetPremium = 0;
        for (Coverage coverage : coverages) {
            totalNetPremium += calculateCoveragePremium(coverage);
        }
        long tax = (long) (totalNetPremium * 0.1);
        long total = totalNetPremium + tax;
        return new Premium(totalNetPremium, tax, total);
    }

    public void validateCoverages(List<Coverage> coverages) {
        if (coverages == null || coverages.isEmpty()) {
            throw new IllegalArgumentException("Coverages cannot be empty");
        }
        if (coverages.stream().noneMatch(c -> c.getCode() == CoverageCode.FIRE)) {
            throw new IllegalArgumentException("Fire coverage is mandatory");
        }
        long uniqueCodes = coverages.stream().map(Coverage::getCode).distinct().count();
        if (uniqueCodes != coverages.size()) {
            throw new IllegalArgumentException("Duplicate coverage codes are not allowed");
        }
        for (Coverage coverage : coverages) {
            if (coverage.getCoverageLimit() == null || coverage.getCoverageLimit() <= 0) {
                throw new IllegalArgumentException("Coverage limit must be greater than 0");
            }
            if (coverage.getDeductible() != null && coverage.getDeductible() >= coverage.getCoverageLimit()) {
                throw new IllegalArgumentException("Deductible must be less than coverage limit");
            }
        }
    }

    public Long calculateCoveragePremium(Coverage coverage) {
        return calculateCoveragePremium(coverage.getCode(), coverage.getCoverageLimit(), coverage.getDeductible());
    }

    public Long calculateCoveragePremium(CoverageCode code, Long coverageLimit, Long deductible) {
        if (coverageLimit == null || coverageLimit <= 0) return 0L;
        Long safeDeductible = deductible == null ? 0L : deductible;
        double basePremium = coverageLimit * getCoverageRate(code);
        double deductibleFactor = calculateDeductibleFactor(safeDeductible, coverageLimit);
        return (long) (basePremium * deductibleFactor);
    }

    private double getCoverageRate(CoverageCode code) {
        return switch (code) {
            case FIRE -> 0.02;
            case THEFT -> 0.015;
            case NATURAL_DISASTER -> 0.025;
        };
    }

    private double calculateDeductibleFactor(Long deductible, Long coverageLimit) {
        double deductibleRatio = (double) deductible / coverageLimit;
        if (deductibleRatio == 0) return 1.0;
        if (deductibleRatio <= 0.01) return 0.95;
        if (deductibleRatio <= 0.02) return 0.90;
        if (deductibleRatio <= 0.05) return 0.80;
        if (deductibleRatio <= 0.10) return 0.70;
        return 0.60;
    }
}