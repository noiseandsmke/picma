package edu.hcmute.dto;

import java.time.LocalDate;

public record PropertyLeadDto(
        Integer id,
        String userInfo,
        String propertyInfo,
        LeadStatus status,
        LocalDate createDate,
        LocalDate expiryDate
) {
    public enum LeadStatus {
        ACTIVE,
        IN_REVIEWING,
        ACCEPTED,
        REJECTED,
        EXPIRED
    }
}