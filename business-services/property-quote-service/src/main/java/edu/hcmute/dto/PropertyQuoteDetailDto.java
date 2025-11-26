package edu.hcmute.dto;

public record PropertyQuoteDetailDto(
        Integer id,
        Integer leadId,
        PropertyQuoteDto propertyQuoteDto,
        QuoteTypeDto quoteTypeDto,
        CoverageTypeDto coverageTypeDto,
        PolicyTypeDto policyTypeDto,
        LeadInfoDto leadInfo
) {
}
