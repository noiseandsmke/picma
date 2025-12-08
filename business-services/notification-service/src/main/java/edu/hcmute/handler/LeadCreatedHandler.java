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
        if (agents.isEmpty()) {
            notificationPersistenceService.save(
                    event.ownerId(),
                    "No Agents Available",
                    String.format("No agents found in your area (zipcode: %s). Consider expanding your search.", event.zipCode())
            );
            return;
        }
        for (AgentInfo agent : agents) {
            String title = "New Lead in Your Area";
            String message = String.format("New insurance request in zipcode %s. Lead #%d. View details now!", event.zipCode(), event.leadId());
            notificationPersistenceService.save(agent.id(), title, message);
        }
    }
}