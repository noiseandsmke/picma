package edu.hcmute.dto;

import java.math.BigDecimal;

public record ValuationDto(
        BigDecimal estimatedConstructionCost
) {
}