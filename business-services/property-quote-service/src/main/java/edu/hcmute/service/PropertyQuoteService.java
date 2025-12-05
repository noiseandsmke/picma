package edu.hcmute.service;

import edu.hcmute.dto.PropertyQuoteDto;

import java.util.List;

public interface PropertyQuoteService {
    PropertyQuoteDto createPropertyQuote(PropertyQuoteDto propertyQuoteDto);

    PropertyQuoteDto getPropertyQuoteById(Integer id);

    List<PropertyQuoteDto> getAllPropertyQuotes(String sort, String order);

    List<PropertyQuoteDto> getQuotesByLeadId(Integer leadId);

    List<PropertyQuoteDto> getQuotesByAgentId(String agentId);

    PropertyQuoteDto updatePropertyQuote(Integer id, PropertyQuoteDto propertyQuoteDto);

    void deletePropertyQuoteById(Integer id);

    void acceptQuote(Integer quoteId);

    void rejectQuote(Integer quoteId);
}