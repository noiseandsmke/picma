package edu.hcmute.event.schema;

import java.io.Serializable;
import java.time.LocalDateTime;

public record QuoteAcceptedEvent(
        Integer quoteId,
        Integer leadId,
        String agentId,
        String ownerId,
        LocalDateTime timestamp
) implements Serializable {
}