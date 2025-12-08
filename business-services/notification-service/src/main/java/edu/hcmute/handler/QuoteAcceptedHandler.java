package edu.hcmute.handler;

import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.service.NotificationPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuoteAcceptedHandler {
    private final NotificationPersistenceService notificationPersistenceService;

    public void handle(QuoteAcceptedEvent event) {
        log.info("Handling QuoteAcceptedEvent for quoteId: {}", event.quoteId());
        notificationPersistenceService.save(
                event.agentId(),
                "Quote Accepted",
                String.format("Owner accepted your quote #%d", event.quoteId())
        );
    }
}