package edu.hcmute.dto;

import edu.hcmute.domain.PlanType;
import edu.hcmute.domain.QuoteStatus;

import java.time.LocalDate;
import java.util.List;

public record PropertyQuoteDto(
        Integer id,
        Integer leadId,
        String agentId,
        LocalDate validUntil,
        LocalDate startDate,
        LocalDate endDate,
        String propertyAddress,
        Long sumInsured,
        PlanType plan,
        QuoteStatus status,
        List<CoverageDto> coverages,
        PremiumDto premium
) {
}