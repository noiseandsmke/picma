package edu.hcmute.dto;

import java.time.LocalDate;

public record PropertyQuoteDto(
        Integer id,
        Integer leadId,
        LocalDate createDate,
        LocalDate expiryDate
) {
}
