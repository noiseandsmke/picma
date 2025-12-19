package edu.hcmute.dto;

public record PropertyLeadDto(
        Integer id,
        String userInfo,
        String propertyInfo,
        String zipCode,
        String status,
        String createDate
) {
}