package edu.hcmute.dto;

import java.time.LocalDate;
import java.util.List;

public record CreatePropertyQuoteDto(
        Integer leadId,
        String agentId,
        LocalDate startDate,
        LocalDate endDate,
        String propertyAddress,
        List<CoverageDto> coverages
) {
}
