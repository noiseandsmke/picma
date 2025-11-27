package edu.hcmute.dto;

public record AgentLeadDto(
        int id,
        String leadAction,
        String agentId,
        int leadId
) {
}