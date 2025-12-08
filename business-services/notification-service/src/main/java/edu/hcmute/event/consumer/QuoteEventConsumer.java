package edu.hcmute.event.consumer;

import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.event.schema.QuoteCreatedEvent;
import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.handler.QuoteAcceptedHandler;
import edu.hcmute.handler.QuoteCreatedHandler;
import edu.hcmute.handler.QuoteRejectedHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuoteEventConsumer {
    private final QuoteCreatedHandler quoteCreatedHandler;
    private final QuoteAcceptedHandler quoteAcceptedHandler;
    private final QuoteRejectedHandler quoteRejectedHandler;

    @Bean
    public Consumer<QuoteCreatedEvent> handleQuoteCreated() {
        return event -> {
            log.info("Received QuoteCreatedEvent: {}", event);
            try {
                quoteCreatedHandler.handle(event);
            } catch (Exception e) {
                log.error("Error processing QuoteCreatedEvent: {}", e.getMessage(), e);
            }
        };
    }

    @Bean
    public Consumer<QuoteAcceptedEvent> handleQuoteAccepted() {
        return event -> {
            log.info("Received QuoteAcceptedEvent: {}", event);
            try {
                quoteAcceptedHandler.handle(event);
            } catch (Exception e) {
                log.error("Error processing QuoteAcceptedEvent: {}", e.getMessage(), e);
            }
        };
    }

    @Bean
    public Consumer<QuoteRejectedEvent> handleQuoteRejected() {
        return event -> {
            log.info("Received QuoteRejectedEvent: {}", event);
            try {
                quoteRejectedHandler.handle(event);
            } catch (Exception e) {
                log.error("Error processing QuoteRejectedEvent: {}", e.getMessage(), e);
            }
        };
    }
}