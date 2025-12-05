package edu.hcmute.dto;

import java.time.LocalDate;

public record LeadTrendDto(
        LocalDate date,
        long count
) {
}