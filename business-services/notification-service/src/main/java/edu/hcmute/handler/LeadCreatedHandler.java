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
    // Persistence removed as per "Realtime Only" requirement

    public void handle(LeadCreatedEvent event) {
        log.info("Handling LeadCreatedEvent for leadId: {}", event.leadId());
        // Logic handled by Property Agent Service (AgentMatchConsumer) to avoid duplicates.
        // Notifications are sent via picma.notifications topic from Agent Service.
    }
}