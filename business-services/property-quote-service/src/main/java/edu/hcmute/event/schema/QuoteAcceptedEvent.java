package edu.hcmute.event.schema;

import java.time.LocalDateTime;

public record QuoteAcceptedEvent(
        Integer quoteId,
        Integer leadId,
        String agentId,
        LocalDateTime timestamp
) {
}