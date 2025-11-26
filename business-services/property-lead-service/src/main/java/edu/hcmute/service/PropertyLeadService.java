package edu.hcmute.service;

import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.PropertyLeadDto;

import java.util.List;

public interface PropertyLeadService {
    PropertyLeadDto createPropertyLead(PropertyLeadDto propertyLeadDto);

    PropertyLeadDto updatePropertyLead(Integer leadId, PropertyLeadDto propertyLeadDto);

    PropertyLeadDto getPropertyLeadById(Integer leadId);

    PropertyLeadDto updateLeadStatus(Integer leadId, String status);

    List<PropertyLeadDto> findAllPropertyLeads();

    List<PropertyLeadDto> findPropertyLeadsByStatus(String status);

    List<PropertyLeadDto> findPropertyLeadsByZipcode(String zipcode);

    List<PropertyLeadDto> findPropertyLeadsOfAgent(String agentId);

    void deletePropertyLeadById(Integer leadId);

    LeadStatsDto getLeadStats();

    List<PropertyLeadDto> getAllLeads(String sort, String order);
}
