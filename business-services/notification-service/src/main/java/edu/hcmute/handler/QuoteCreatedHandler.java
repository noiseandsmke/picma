package edu.hcmute.handler;

import edu.hcmute.event.schema.QuoteCreatedEvent;
import edu.hcmute.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuoteCreatedHandler {
    private final SseService sseService;

    public void handle(QuoteCreatedEvent event) {
        log.info("Handling QuoteCreatedEvent for quoteId: {}", event.quoteId());
        String title = "New Quote Available";
        String message = String.format("Agent sent you a quote for Lead #%d. Premium: %.2f/year. Review and accept now!", event.leadId(), event.premium());
        
        edu.hcmute.dto.NotificationRequestDto notification = new edu.hcmute.dto.NotificationRequestDto(
                event.ownerId(),
                title,
                message
        );
        sseService.sendNotification(event.ownerId(), notification);
    }
}