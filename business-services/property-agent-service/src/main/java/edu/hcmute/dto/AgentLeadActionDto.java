package edu.hcmute.dto;

import edu.hcmute.domain.LeadAction;

import java.time.LocalDateTime;

public record AgentLeadActionDto(
        int id,
        LeadAction leadAction,
        String agentId,
        int leadId,
        LocalDateTime createdAt
) {
}