package edu.hcmute.dto;

public record PremiumDto(
        Long net,
        Long tax,
        Long total
) {
}