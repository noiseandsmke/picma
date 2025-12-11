package edu.hcmute.event.consumer;

import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.config.UserMgmtFeignClient;
import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.dto.PropertyMgmtDto;
import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.AgentLead;
import edu.hcmute.event.NotificationProducer;
import edu.hcmute.event.schema.LeadCreatedEvent;
import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.event.schema.QuoteCreatedEvent;
import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.repo.AgentLeadRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentMatchConsumer {
    private final NotificationProducer notificationProducer;
    private final UserMgmtFeignClient userMgmtFeignClient;
    private final PropertyMgmtFeignClient propertyMgmtFeignClient;
    private final AgentLeadRepo agentLeadRepo;

    @Bean
    public Consumer<LeadCreatedEvent> handleLeadCreated() {
        return event -> {
            log.info("Matching Agents for New Lead: {}", event);
            try {
                String zipCode = resolveZipCode(event);
                if (StringUtils.hasText(zipCode)) {
                    notifyAndCreateAgentLeads(zipCode, event.leadId());
                } else {
                    log.warn("No zipCode found for matching, skipping agent notification.");
                }
            } catch (Exception e) {
                log.error("Error processing LeadCreatedEvent for agent matching: {}", e.getMessage(), e);
            }
        };
    }

    private String resolveZipCode(LeadCreatedEvent event) {
        String zipCode = event.zipCode();
        if ("N/A".equals(zipCode) || !StringUtils.hasText(zipCode)) {
            PropertyMgmtDto propertyInfo = propertyMgmtFeignClient.getPropertyInfoById(event.propertyId());
            if (propertyInfo != null && propertyInfo.propertyAddressDto() != null) {
                zipCode = propertyInfo.propertyAddressDto().zipCode();
            }
        }
        return zipCode;
    }

    private void notifyAndCreateAgentLeads(String zipCode, int leadId) {
        log.info("Searching agents in zipcode: {}", zipCode);
        List<UserDto> agents = userMgmtFeignClient.getAgentsByZipCode(zipCode);
        for (UserDto agent : agents) {
            sendNotification(agent.id(), zipCode, leadId);
            createAgentLead(agent.id(), leadId);
        }
    }

    private void sendNotification(String agentId, String zipCode, int leadId) {
        NotificationRequestDto notification = new NotificationRequestDto(
                agentId,
                "New Lead Available",
                "A new lead matches your zip code: " + zipCode + ". Lead ID: " + leadId
        );
        notificationProducer.sendNotification(notification);
        log.info("Notified agent: {}", agentId);
    }

    private void createAgentLead(String agentId, int leadId) {
        try {
            AgentLead agentLead = new AgentLead();
            agentLead.setAgentId(agentId);
            agentLead.setLeadId(leadId);
            agentLead.setCreatedAt(LocalDateTime.now());
            agentLead.setLeadAction(LeadAction.INTERESTED);
            agentLeadRepo.save(agentLead);
            log.info("Created AgentLead record for agent: {}, lead: {}", agentId, leadId);
        } catch (Exception ex) {
            log.error("Failed to save AgentLead for agent: {}, lead: {}", agentId, leadId, ex);
        }
    }

    @Bean
    public Consumer<QuoteCreatedEvent> handleQuoteCreated() {
        return event -> updateAgentLeadAction(
                event.agentId(),
                event.leadId(),
                LeadAction.ACCEPTED,
                "Quote Created"
        );
    }

    @Bean
    public Consumer<QuoteAcceptedEvent> handleQuoteAccepted() {
        return event -> {
            log.info("Received QuoteAcceptedEvent: {}", event);
            log.info("Quote accepted by Owner for lead: {}, agent: {}. Internal status confirmed.", event.leadId(), event.agentId());
        };
    }

    @Bean
    public Consumer<QuoteRejectedEvent> handleQuoteRejected() {
        return event -> updateAgentLeadAction(
                event.agentId(),
                event.leadId(),
                LeadAction.REJECTED,
                "Quote Rejected"
        );
    }

    private void updateAgentLeadAction(String agentId, int leadId, LeadAction action, String context) {
        try {
            Optional<AgentLead> optionalAgentLead = agentLeadRepo.findByAgentIdAndLeadId(agentId, leadId);
            if (optionalAgentLead.isPresent()) {
                AgentLead agentLead = optionalAgentLead.get();
                agentLead.setLeadAction(action);
                agentLeadRepo.save(agentLead);
                log.info("Updated AgentLead action to {} ({}) for agent: {}, lead: {}", action, context, agentId, leadId);
            } else {
                log.warn("AgentLead record not found for agent: {}, lead: {}", agentId, leadId);
            }
        } catch (Exception e) {
            log.error("Error updating AgentLead action ({}) : {}", context, e.getMessage(), e);
        }
    }
}