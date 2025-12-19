package edu.hcmute.dto;

import java.math.BigDecimal;

public record CoverageDto(
        String code,
        BigDecimal limit,
        BigDecimal deductible
) {
}