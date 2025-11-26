package edu.hcmute.dto;

import java.time.LocalDate;

public record LeadInfoDto(
        Integer id,
        String userInfo,
        String propertyInfo,
        String status,
        LocalDate createDate,
        LocalDate expiryDate
) {
}
