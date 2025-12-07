package edu.hcmute.event.schema;

import java.io.Serializable;
import java.time.LocalDateTime;

public record LeadCreatedEvent(
        Integer leadId,
        String propertyId,
        String ownerId,
        String zipCode,
        LocalDateTime timestamp
) implements Serializable {
}