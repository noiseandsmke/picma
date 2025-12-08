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
                "Quote Rejected",
                String.format("Owner rejected your quote. Reason: %s", event.reason())
        );
    }
}