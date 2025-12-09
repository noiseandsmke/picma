package edu.hcmute.dto;

import edu.hcmute.domain.LeadAction;

import java.time.LocalDateTime;

public record AgentLeadDto(
        int id,
        LeadAction leadAction,
        String agentId,
        int leadId,
        LocalDateTime createdAt,
        String userInfo,
        String propertyInfo
) {
}