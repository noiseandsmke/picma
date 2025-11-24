package edu.hcmute.dto;

import edu.hcmute.domain.LeadAction;

public record AgentLeadDto(
        int id,
        LeadAction leadAction,
        String agentId,
        int leadId
) {
}