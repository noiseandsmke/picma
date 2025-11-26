package edu.hcmute.dto;

import edu.hcmute.domain.PlanType;

import java.time.LocalDate;
import java.util.List;

public record PropertyQuoteDto(
        Integer id,
        Integer leadId,
        String agentId,
        String agentName,
        LocalDate validUntil,
        LocalDate startDate,
        LocalDate endDate,
        String propertyAddress,
        Long sumInsured,
        PlanType plan,
        List<CoverageDto> coverages,
        PremiumDto premium
) {
}
