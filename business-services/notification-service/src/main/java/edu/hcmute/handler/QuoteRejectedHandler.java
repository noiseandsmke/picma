package edu.hcmute.handler;

import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuoteRejectedHandler {
    private final SseService sseService;

    public void handle(QuoteRejectedEvent event) {
        log.info("Handling QuoteRejectedEvent for quoteId: {}", event.quoteId());
        String title = "Quote Declined";
        String message = String.format("Owner declined your quote #%d for Lead #%d. Reason: %s. Consider revising and resubmitting.", event.quoteId(), event.leadId(), event.reason());
        
        edu.hcmute.dto.NotificationRequestDto notification = new edu.hcmute.dto.NotificationRequestDto(
                event.agentId(),
                title,
                message
        );
        sseService.sendNotification(event.agentId(), notification);
    }
}