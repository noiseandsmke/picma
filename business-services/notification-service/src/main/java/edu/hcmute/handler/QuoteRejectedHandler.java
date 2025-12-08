package edu.hcmute.handler;

import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.service.NotificationPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuoteRejectedHandler {
    private final NotificationPersistenceService notificationPersistenceService;

    public void handle(QuoteRejectedEvent event) {
        log.info("Handling QuoteRejectedEvent for quoteId: {}", event.quoteId());
        notificationPersistenceService.save(
                event.agentId(),
                "Quote Declined",
                String.format("Owner declined your quote #%d for Lead #%d. Reason: %s. Consider revising and resubmitting.", event.quoteId(), event.leadId(), event.reason())
        );
    }
}