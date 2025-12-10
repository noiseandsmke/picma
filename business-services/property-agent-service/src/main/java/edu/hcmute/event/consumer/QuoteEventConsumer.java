package edu.hcmute.event.consumer;

import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.event.schema.QuoteCreatedEvent;
import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.service.PropertyAgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.function.Consumer;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuoteEventConsumer {
    private final PropertyAgentService propertyAgentService;

    @Bean
    public Consumer<QuoteCreatedEvent> handleQuoteCreated() {
        return event -> {
            log.info("Received QuoteCreatedEvent for quoteId: {}, agentId: {}", event.quoteId(), event.agentId());
            updateAgentAction(event.agentId(), event.leadId(), LeadAction.ACCEPTED);
        };
    }

    @Bean
    public Consumer<QuoteAcceptedEvent> handleQuoteAccepted() {
        return event -> {
            log.info("Received QuoteAcceptedEvent for quoteId: {}, agentId: {}", event.quoteId(), event.agentId());
            updateAgentAction(event.agentId(), event.leadId(), LeadAction.ACCEPTED);
        };
    }

    @Bean
    public Consumer<QuoteRejectedEvent> handleQuoteRejected() {
        return event -> {
            log.info("Received QuoteRejectedEvent for quoteId: {}, agentId: {}", event.quoteId(), event.agentId());
            updateAgentAction(event.agentId(), event.leadId(), LeadAction.REJECTED);
        };
    }

    private void updateAgentAction(String agentId, Integer leadId, LeadAction action) {
        try {
            AgentLeadDto agentLeadDto = new AgentLeadDto(0, action, agentId, leadId, LocalDateTime.now(), null, null);
            propertyAgentService.updateLeadAction(agentLeadDto);
            log.info("Agent lead action updated to {} for agentId: {}, leadId: {}", action, agentId, leadId);
        } catch (Exception e) {
            log.error("Error updating agent lead action: {}", e.getMessage(), e);
        }
    }
}