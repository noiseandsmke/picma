package edu.hcmute.event;

import edu.hcmute.event.schema.LeadCreatedEvent;
import edu.hcmute.event.schema.LeadStatusChangedEvent;
import edu.hcmute.event.schema.QuoteGeneratedEvent;
import edu.hcmute.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class DomainEventConsumer {
    private final NotificationService notificationService;

    @Bean
    public Consumer<LeadStatusChangedEvent> handleLeadStatusChanged() {
        return event -> {
            log.info("Processing Lead Status Change: {}", event);
            try {
                if ("ACCEPTED".equalsIgnoreCase(event.newStatus())) {
                    NotificationRequestDto request = new NotificationRequestDto(
                            event.agentId(),
                            "Lead Accepted!",
                            "Lead " + event.leadId() + " has been accepted."
                    );
                    notificationService.createNotification(request);
                } else if ("REJECTED".equalsIgnoreCase(event.newStatus())) {
                }
            } catch (Exception e) {
                log.error("Error processing LeadStatusChangedEvent: {}", e.getMessage(), e);
            }
        };
    }

    @Bean
    public Consumer<QuoteGeneratedEvent> handleQuoteGenerated() {
        return event -> {
            log.info("Processing Quote Generated: {}", event);
        };
    }

    @Bean
    public Consumer<LeadCreatedEvent> handleLeadCreated() {
        return event -> {
            log.info("Processing Lead Created: {}", event);
        };
    }
}