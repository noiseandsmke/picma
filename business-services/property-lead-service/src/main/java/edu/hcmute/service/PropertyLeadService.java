package edu.hcmute.service;

import edu.hcmute.dto.PropertyLeadDto;

import java.util.List;

public interface PropertyLeadService {
    PropertyLeadDto createOrUpdatePropertyLead(PropertyLeadDto propertyLeadDto);

    PropertyLeadDto createPropertyLeadByQuote(Integer quoteId);

    List<PropertyLeadDto> findAllPropertyLeads();

    List<PropertyLeadDto> findPropertyLeadsByStatus(String status);

    List<PropertyLeadDto> findPropertyLeadsByZipcode(Integer zipcode);

    List<PropertyLeadDto> findPropertyLeadsOfAgent(Integer agentId);

    PropertyLeadDto deletePropertyLeadById(Integer leadId);
}