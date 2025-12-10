package edu.hcmute.service;

import edu.hcmute.event.schema.LeadStatusChangedEvent;
import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.event.schema.QuoteRejectedEvent;

public interface OwnerService {
    void updateOwnerHistory(LeadStatusChangedEvent event);

    void handleQuoteAccepted(QuoteAcceptedEvent event);

    void handleQuoteRejected(QuoteRejectedEvent event);
}