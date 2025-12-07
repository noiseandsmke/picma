package edu.hcmute.event.schema;

import java.io.Serializable;
import java.time.LocalDateTime;

public record LeadStatusChangedEvent(
        Integer leadId,
        String oldStatus,
        String newStatus,
        String agentId,
        String reason,
        LocalDateTime timestamp
) implements Serializable {
}