package edu.hcmute.service;

import edu.hcmute.dto.AgentLeadDto;

import java.util.List;

public interface PropertyAgentService {
    List<String> fetchAgentWithinZipCode(String propertyId, int leadId);

    AgentLeadDto updateLeadAction(AgentLeadDto agentLeadDto);

    List<String> getAgentsByZipCode(String zipCode);

    List<AgentLeadDto> getAgentLeads(String agentId);
}