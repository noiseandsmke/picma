package edu.hcmute.event.schema;

import java.time.LocalDateTime;

public record QuoteRejectedEvent(
        Integer quoteId,
        Integer leadId,
        String agentId,
        LocalDateTime timestamp
) {
}