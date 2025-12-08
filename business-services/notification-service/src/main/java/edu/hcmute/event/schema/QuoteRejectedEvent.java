package edu.hcmute.event.schema;

import java.io.Serializable;
import java.time.LocalDateTime;

public record QuoteRejectedEvent(
        Integer quoteId,
        Integer leadId,
        String agentId,
        String ownerId,
        String reason,
        LocalDateTime timestamp
) implements Serializable {
}