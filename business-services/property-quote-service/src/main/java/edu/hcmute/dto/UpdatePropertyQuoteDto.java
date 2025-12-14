package edu.hcmute.dto;

import java.time.LocalDate;
import java.util.List;

public record UpdatePropertyQuoteDto(
        LocalDate startDate,
        LocalDate endDate,
        String propertyAddress,
        List<CoverageDto> coverages
) {
}
