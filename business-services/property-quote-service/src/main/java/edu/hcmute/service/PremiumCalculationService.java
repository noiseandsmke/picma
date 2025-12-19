package edu.hcmute.service;

import edu.hcmute.domain.CoverageCode;
import edu.hcmute.entity.Premium;
import edu.hcmute.entity.QuoteCoverage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class PremiumCalculationService {
    private static final Map<CoverageCode, Double> RATES = Map.of(
            CoverageCode.FIRE, 0.02,
            CoverageCode.THEFT, 0.015,
            CoverageCode.NATURAL_DISASTER, 0.025
    );

    public Premium calculatePremium(List<QuoteCoverage> coverages) {
        if (coverages == null || coverages.isEmpty()) {
            return new Premium(0L, 0L, 0L);
        }
        long totalNetPremium = coverages.stream()
                .mapToLong(this::calculateQuoteCoveragePremium)
                .sum();
        long tax = (long) (totalNetPremium * 0.1);
        long total = totalNetPremium + tax;
        return new Premium(totalNetPremium, tax, total);
    }

    private Long calculateQuoteCoveragePremium(QuoteCoverage coverage) {
        return calculateQuoteCoveragePremium(coverage.getCode(), coverage.getCoverageLimit(), coverage.getDeductible());
    }

    private Long calculateQuoteCoveragePremium(CoverageCode code, Long coverageLimit, Double deductible) {
        double basePremium = coverageLimit * RATES.get(code);
        double discount = calculateDiscount(deductible);
        return (long) (basePremium * discount);
    }

    private double calculateDiscount(Double deductible) {
        if (deductible == 0) return 1.0;
        return Math.max(0.6, Math.exp(-5.0 * deductible));
    }

    public void validateQuoteCoverages(List<QuoteCoverage> coverages) {
        if (coverages == null || coverages.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QuoteCoverages cannot be empty");
        }
        if (coverages.stream().noneMatch(c -> c.getCode() == CoverageCode.FIRE)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fire coverage is mandatory");
        }
        long uniqueCodes = coverages.stream().map(QuoteCoverage::getCode).distinct().count();
        if (uniqueCodes != coverages.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate coverage codes are not allowed");
        }
        for (QuoteCoverage coverage : coverages) {
            if (coverage.getCoverageLimit() == null || coverage.getCoverageLimit() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QuoteCoverage limit must be greater than 0");
            }
            if (coverage.getDeductible() != null && (coverage.getDeductible() < 0 || coverage.getDeductible() > 1.0)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deductible must be between 0.0 and 1.0");
            }
        }
    }
}