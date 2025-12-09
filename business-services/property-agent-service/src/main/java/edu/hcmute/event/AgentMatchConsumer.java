package edu.hcmute.event;

import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.config.UserMgmtFeignClient;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.dto.PropertyMgmtDto;
import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.AgentLead;
import edu.hcmute.event.schema.LeadCreatedEvent;
import edu.hcmute.repo.AgentLeadRepo;
import edu.hcmute.service.PropertyAgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentMatchConsumer {
    private final PropertyAgentService propertyAgentService;
    private final NotificationProducer notificationProducer;
    private final UserMgmtFeignClient userMgmtFeignClient;
    private final PropertyMgmtFeignClient propertyMgmtFeignClient;
    private final AgentLeadRepo agentLeadRepo;

    @Bean
    public Consumer<LeadCreatedEvent> handleLeadCreated() {
        return event -> {
            log.info("Matching Agents for New Lead: {}", event);
            try {
                String zipCode = event.zipCode();
                if ("N/A".equals(zipCode) || !StringUtils.hasText(zipCode)) {
                    PropertyMgmtDto propertyInfo = propertyMgmtFeignClient.getPropertyInfoById(event.propertyId());
                    if (propertyInfo != null && propertyInfo.propertyAddressDto() != null) {
                        zipCode = propertyInfo.propertyAddressDto().zipCode();
                    }
                }
                if (StringUtils.hasText(zipCode)) {
                    log.info("Searching agents in zipcode: {}", zipCode);
                    List<UserDto> agents = userMgmtFeignClient.getAgentsByZipCode(zipCode);
                    for (UserDto agent : agents) {
                        NotificationRequestDto notification = new NotificationRequestDto(
                                agent.id(),
                                "New Lead Available",
                                "A new lead matches your zip code: " + zipCode + ". Lead ID: " + event.leadId()
                        );
                        notificationProducer.sendNotification(notification);
                        log.info("Notified agent: {}", agent.id());
                        try {
                            AgentLead agentLead = new AgentLead();
                            agentLead.setAgentId(agent.id());
                            agentLead.setLeadId(event.leadId());
                            agentLead.setCreatedAt(LocalDateTime.now());
                            agentLead.setLeadAction(null);
                            agentLeadRepo.save(agentLead);
                            log.info("Created AgentLead record for agent: {}, lead: {}", agent.id(), event.leadId());
                        } catch (Exception ex) {
                            log.error("Failed to save AgentLead for agent: {}, lead: {}", agent.id(), event.leadId(), ex);
                        }
                    }
                } else {
                    log.warn("No zipCode found for matching, skipping agent notification.");
                }
            } catch (Exception e) {
                log.error("Error processing LeadCreatedEvent for agent matching: {}", e.getMessage(), e);
            }
        };
    }
}