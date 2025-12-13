package edu.hcmute.service;

import edu.hcmute.dto.AgentLeadActionDto;
import edu.hcmute.dto.PropertyAgentDto;

import java.util.List;

public interface PropertyAgentService {
    List<String> fetchAgentWithinZipCode(String propertyId, int leadId);

    AgentLeadActionDto updateLeadActionByAgent(AgentLeadActionDto agentLeadActionDto);

    AgentLeadActionDto updateLeadActionBySystem(AgentLeadActionDto agentLeadActionDto);

    List<String> getAgentsByZipCode(String zipCode);

    List<AgentLeadActionDto> getAgentLeads(String agentId);

    PropertyAgentDto getAgentById(String agentId);
}