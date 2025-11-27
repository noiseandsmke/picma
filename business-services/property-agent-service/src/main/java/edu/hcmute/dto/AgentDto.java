package edu.hcmute.dto;

public record AgentDto(
        String id,
        String fullName,
        String email,
        String zipCode
) {
}