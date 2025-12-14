package edu.hcmute.service;

import edu.hcmute.dto.CreatePropertyQuoteDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.dto.UpdatePropertyQuoteDto;

import java.util.List;

public interface PropertyQuoteService {
    PropertyQuoteDto createPropertyQuote(CreatePropertyQuoteDto createDto);

    PropertyQuoteDto getPropertyQuoteById(Integer id);

    List<PropertyQuoteDto> getAllPropertyQuotes(String sort, String order);

    List<PropertyQuoteDto> getQuotesByLeadId(Integer leadId);

    List<PropertyQuoteDto> getQuotesByAgentId(String agentId);

    PropertyQuoteDto updatePropertyQuote(Integer id, UpdatePropertyQuoteDto updateDto);

    void deletePropertyQuoteById(Integer id);

    void acceptQuote(Integer quoteId);

    void rejectQuote(Integer quoteId);
}