package edu.hcmute.dto;

import java.time.LocalDate;

public record PropertyLeadDto(
        Integer id,
        String userInfo,
        String propertyInfo,
        String status,
        LocalDate startDate,
        LocalDate expiryDate
) {
}