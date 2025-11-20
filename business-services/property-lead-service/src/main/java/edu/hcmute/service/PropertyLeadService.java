package edu.hcmute.service;

import edu.hcmute.dto.PropertyLeadDto;

import java.util.List;

public interface PropertyLeadService {
    PropertyLeadDto createOrUpdatePropertyLead(PropertyLeadDto propertyLeadDto);

    PropertyLeadDto createPropertyLeadByQuote(Integer quoteId);

    PropertyLeadDto getPropertyLeadById(Integer leadId);

    PropertyLeadDto updateLeadStatus(Integer leadId, String status);

    List<PropertyLeadDto> findAllPropertyLeads();

    List<PropertyLeadDto> findPropertyLeadsByStatus(String status);

    List<PropertyLeadDto> findPropertyLeadsByZipcode(String zipcode);

    List<PropertyLeadDto> findPropertyLeadsOfAgent(Integer agentId);

    List<PropertyLeadDto> deletePropertyLeadById(Integer leadId);
}