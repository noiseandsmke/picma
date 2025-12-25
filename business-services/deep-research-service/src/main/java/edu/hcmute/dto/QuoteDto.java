package edu.hcmute.dto;

import java.util.List;

public record QuoteDto(
        Integer id,
        Integer leadId,
        String agentId,
        String createdDate,
        String status,
        List<CoverageDto> coverages,
        PremiumDto premium
) {
}