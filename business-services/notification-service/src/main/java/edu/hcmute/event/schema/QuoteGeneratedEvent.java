package edu.hcmute.event.schema;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public record QuoteGeneratedEvent(
        String quoteId,
        Integer leadId,
        BigDecimal premium,
        Map<String, String> coverageDetails,
        LocalDateTime timestamp
) implements Serializable {
}