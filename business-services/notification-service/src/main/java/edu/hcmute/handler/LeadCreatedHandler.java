package edu.hcmute.handler;

import edu.hcmute.dto.AgentInfo;
import edu.hcmute.event.schema.LeadCreatedEvent;
import edu.hcmute.service.NotificationPersistenceService;
import edu.hcmute.service.UserLookupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeadCreatedHandler {
    private final UserLookupService userLookupService;
    private final NotificationPersistenceService notificationPersistenceService;

    public void handle(LeadCreatedEvent event) {
        log.info("Handling LeadCreatedEvent for leadId: {}", event.leadId());
        List<AgentInfo> agents = userLookupService.getAgentsByZipCode(event.zipCode());
        for (AgentInfo agent : agents) {
            String title = "New Lead Available";
            String message = String.format("Lead #%d in zipcode %s", event.leadId(), event.zipCode());
            notificationPersistenceService.save(agent.id(), title, message);
        }
    }
}