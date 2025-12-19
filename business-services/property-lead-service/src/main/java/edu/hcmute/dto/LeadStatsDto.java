package edu.hcmute.dto;

public record LeadStatsDto(
        long totalLeads,
        long newLeads,
        long inReviewLeads,
        long acceptedLeads
) {
}