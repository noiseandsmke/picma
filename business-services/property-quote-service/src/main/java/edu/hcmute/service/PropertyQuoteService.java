package edu.hcmute.service;

import edu.hcmute.dto.CreateQuoteDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.dto.QuoteTrendDto;
import edu.hcmute.dto.UpdateQuoteDto;

import java.util.List;

public interface PropertyQuoteService {
    PropertyQuoteDto createPropertyQuote(CreateQuoteDto createDto);

    PropertyQuoteDto getPropertyQuoteById(Integer id);

    List<PropertyQuoteDto> getAllPropertyQuotes(String sortBy, String sortDirection, String status, String agentId);

    List<PropertyQuoteDto> getQuotesByLeadId(Integer leadId);

    List<PropertyQuoteDto> getQuotesByAgentId(String agentId);

    PropertyQuoteDto updatePropertyQuote(Integer id, UpdateQuoteDto updateDto);

    void deletePropertyQuoteById(Integer id);

    void acceptQuote(Integer quoteId);

    void rejectQuote(Integer quoteId);

    List<QuoteTrendDto> getQuoteTrend();
}