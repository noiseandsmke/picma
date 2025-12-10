package edu.hcmute.event.schema;

import java.time.LocalDateTime;

public record QuoteCreatedEvent(
        Integer quoteId,
        Integer leadId,
        String agentId,
        Double amount,
        LocalDateTime timestamp
) {
}