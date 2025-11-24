package edu.hcmute.dto;

public record PropertyQuoteDetailDto(
        Integer id,
        PropertyQuoteDto propertyQuoteDto,
        QuoteTypeDto quoteTypeDto,
        CoverageTypeDto coverageTypeDto,
        PolicyTypeDto policyTypeDto
) {
}