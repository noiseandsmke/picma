package edu.hcmute.dto;

import java.util.List;

public record UpdateQuoteDto(
        List<CoverageDto> coverages
) {
}