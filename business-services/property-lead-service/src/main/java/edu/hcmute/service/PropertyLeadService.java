package edu.hcmute.service;

import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.LeadTrendDto;
import edu.hcmute.dto.PropertyLeadDto;

import java.util.List;

public interface PropertyLeadService {
    PropertyLeadDto createPropertyLead(PropertyLeadDto propertyLeadDto);

    PropertyLeadDto updatePropertyLead(Integer leadId, PropertyLeadDto propertyLeadDto);

    PropertyLeadDto getPropertyLeadById(Integer leadId);

    PropertyLeadDto updatePropertyLeadStatus(Integer leadId, String status);

    List<PropertyLeadDto> getAllPropertyLeads(String sortBy, String sortDirection, String status);

    List<PropertyLeadDto> findPropertyLeadsByStatus(String status);

    List<PropertyLeadDto> findPropertyLeadsByZipCode(String zipCode);

    List<PropertyLeadDto> findPropertyLeadsByUser(String userId);

    void deletePropertyLeadById(Integer leadId);

    LeadStatsDto getLeadStats();

    List<LeadTrendDto> getLeadTrend();
}