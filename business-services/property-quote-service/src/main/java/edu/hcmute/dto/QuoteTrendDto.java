package edu.hcmute.dto;

import java.time.LocalDate;

public record QuoteTrendDto(
        LocalDate date,
        long count
) {
}
