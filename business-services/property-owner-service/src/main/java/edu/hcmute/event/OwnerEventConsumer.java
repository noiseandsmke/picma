package edu.hcmute.event;

import edu.hcmute.event.schema.LeadStatusChangedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
@Slf4j
public class OwnerEventConsumer {

    @Bean
    public Consumer<LeadStatusChangedEvent> handleLeadStatusChanged() {
        return event -> {
            log.info("Received LeadStatusChangedEvent: {}", event);
            // Logic to update owner portfolio in MongoDB
            // e.g., finding the property related to this lead and updating its insurance status
        };
    }
}