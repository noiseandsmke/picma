package edu.hcmute.event;

import edu.hcmute.event.schema.LeadStatusChangedEvent;
import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.service.OwnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
@Slf4j
@RequiredArgsConstructor
public class OwnerEventConsumer {

    private final OwnerService ownerService;

    @Bean
    public Consumer<LeadStatusChangedEvent> handleLeadStatusChanged() {
        return event -> {
            log.info("Received LeadStatusChangedEvent: {}", event);
            ownerService.updateOwnerHistory(event);
        };
    }

    @Bean
    public Consumer<QuoteAcceptedEvent> handleQuoteAccepted() {
        return event -> {
            log.info("Received QuoteAcceptedEvent: {}", event);
            ownerService.handleQuoteAccepted(event);
        };
    }

    @Bean
    public Consumer<QuoteRejectedEvent> handleQuoteRejected() {
        return event -> {
            log.info("Received QuoteRejectedEvent: {}", event);
            ownerService.handleQuoteRejected(event);
        };
    }
}