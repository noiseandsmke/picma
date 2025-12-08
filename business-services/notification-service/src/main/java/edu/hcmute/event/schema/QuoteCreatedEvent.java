package edu.hcmute.event.schema;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

public record QuoteCreatedEvent(
        Integer quoteId,
        Integer leadId,
        String agentId,
        String ownerId,
        Long premium,
        String plan,
        List<QuoteCoverage> coverages,
        LocalDateTime timestamp
) implements Serializable {
    public record QuoteCoverage(
            String code,
            Long limit,
            Long deductible
    ) implements Serializable {
    }
}