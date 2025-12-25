package edu.hcmute.dto;

import java.util.List;

public record CreateQuoteDto(
        Integer leadId,
        String agentId,
        List<CoverageDto> coverages
) {
}