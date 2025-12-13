package edu.hcmute.event.consumer;

import edu.hcmute.event.schema.LeadStatusChangedEvent;
import edu.hcmute.handler.LeadStatusChangedHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadEventConsumer {
    private final LeadStatusChangedHandler leadStatusChangedHandler;

    @Bean
    public Consumer<LeadStatusChangedEvent> handleLeadStatusChanged() {
        return event -> {
            log.info("Received LeadStatusChangedEvent: {}", event);
            try {
                leadStatusChangedHandler.handle(event);
            } catch (Exception e) {
                log.error("Error processing LeadStatusChangedEvent: {}", e.getMessage(), e);
            }
        };
    }
}