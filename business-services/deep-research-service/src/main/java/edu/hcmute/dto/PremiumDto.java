package edu.hcmute.dto;

import java.math.BigDecimal;

public record PremiumDto(
        BigDecimal net,
        BigDecimal tax,
        BigDecimal total
) {
}