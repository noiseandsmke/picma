package edu.hcmute.service;

import edu.hcmute.dto.PropertyQuoteDto;

import java.util.List;

public interface PropertyQuoteService {
    PropertyQuoteDto createPropertyQuote(PropertyQuoteDto propertyQuoteDto);

    PropertyQuoteDto getPropertyQuoteById(Integer id);

    List<PropertyQuoteDto> getAllPropertyQuotes();
}