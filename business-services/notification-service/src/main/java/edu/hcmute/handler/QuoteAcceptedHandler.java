package edu.hcmute.handler;

import edu.hcmute.event.schema.QuoteAcceptedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuoteAcceptedHandler {
    public void handle(QuoteAcceptedEvent event) {
        log.info("Handling QuoteAcceptedEvent for quoteId: {}", event.quoteId());
    }
}