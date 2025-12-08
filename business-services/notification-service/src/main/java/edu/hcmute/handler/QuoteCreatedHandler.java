package edu.hcmute.handler;

import edu.hcmute.event.schema.QuoteCreatedEvent;
import edu.hcmute.service.NotificationPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuoteCreatedHandler {
    private final NotificationPersistenceService notificationPersistenceService;

    public void handle(QuoteCreatedEvent event) {
        log.info("Handling QuoteCreatedEvent for quoteId: {}", event.quoteId());
        notificationPersistenceService.save(
                event.ownerId(),
                "New Quote Received",
                String.format("You received a quote from Agent, Premium: %d", event.premium())
        );
    }
}