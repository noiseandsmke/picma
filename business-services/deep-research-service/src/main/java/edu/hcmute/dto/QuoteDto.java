package edu.hcmute.dto;

import java.time.LocalDate;
import java.util.List;

public record QuoteDto(
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
        QuoteStatus status,
        List<CoverageDto> coverages,
        PremiumDto premium
) {
    public enum PlanType {
        BRONZE,
        SILVER,
        GOLD
    }

    public enum QuoteStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}