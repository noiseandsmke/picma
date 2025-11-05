package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PropertyQuoteDetailDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 6364057091248281256L;
    private Integer id;
    private PropertyQuoteDto propertyQuoteDto;
    private QuoteTypeDto quoteTypeDto;
    private CoverageTypeDto coverageTypeDto;
    private PolicyTypeDto policyTypeDto;
}