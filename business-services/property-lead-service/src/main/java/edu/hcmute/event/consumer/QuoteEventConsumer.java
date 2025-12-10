package edu.hcmute.event.consumer;

import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.service.PropertyLeadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuoteEventConsumer {
    private final PropertyLeadService propertyLeadService;

    @Bean
    public Consumer<QuoteAcceptedEvent> handleQuoteAccepted() {
        return event -> {
            log.info("Received QuoteAcceptedEvent for quoteId: {}, leadId: {}", event.quoteId(), event.leadId());
            try {
                propertyLeadService.updateLeadStatus(event.leadId(), "ACCEPTED");
                log.info("Lead status updated to ACCEPTED for leadId: {}", event.leadId());
            } catch (Exception e) {
                log.error("Error updating lead status for leadId: {}", event.leadId(), e);
            }
        };
    }
}