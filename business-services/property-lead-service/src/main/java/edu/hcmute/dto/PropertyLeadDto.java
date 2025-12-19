package edu.hcmute.dto;

import edu.hcmute.domain.LeadStatus;

import java.time.LocalDate;

public record PropertyLeadDto(
        Integer id,
        String userInfo,
        String propertyInfo,
        String zipCode,
        LeadStatus status,
        LocalDate createDate
) {
}
