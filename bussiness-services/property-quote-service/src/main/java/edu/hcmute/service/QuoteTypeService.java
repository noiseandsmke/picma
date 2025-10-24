package edu.hcmute.service;

import edu.hcmute.dto.QuoteTypeDto;

import java.util.List;

public interface QuoteTypeService {
    QuoteTypeDto createQuoteType(QuoteTypeDto quoteTypeDto);

    QuoteTypeDto getQuoteTypeById(Integer id);

    List<QuoteTypeDto> getAllQuoteTypes();
}