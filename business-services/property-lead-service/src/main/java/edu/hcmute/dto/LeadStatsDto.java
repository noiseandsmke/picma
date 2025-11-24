package edu.hcmute.dto;

public record LeadStatsDto(
        long totalLeads,
        long acceptedLeads,
        long rejectedLeads,
        long overdueLeads
) {
}