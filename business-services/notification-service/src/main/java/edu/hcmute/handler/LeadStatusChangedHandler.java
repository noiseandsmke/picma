package edu.hcmute.handler;

import edu.hcmute.event.schema.LeadStatusChangedEvent;
import edu.hcmute.service.NotificationPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeadStatusChangedHandler {
    private final NotificationPersistenceService notificationPersistenceService;

    public void handle(LeadStatusChangedEvent event) {
        log.info("Handling LeadStatusChangedEvent for leadId: {}, newStatus: {}", event.leadId(), event.newStatus());
        String status = event.newStatus();
        if (status == null) return;
        switch (status.toUpperCase()) {
            case "IN_REVIEWING":
                notificationPersistenceService.save(
                        event.ownerId(),
                        "Agent Reviewing Lead",
                        "Agent is reviewing your request."
                );
                break;
            case "ACCEPTED":
                notificationPersistenceService.save(
                        event.ownerId(),
                        "Lead Accepted",
                        "Lead has been accepted by owner."
                );
                break;
            case "REJECTED":
                notificationPersistenceService.save(
                        event.ownerId(),
                        "Lead Rejected",
                        "No Agent accepted your request."
                );
                break;
            case "EXPIRED":
                notificationPersistenceService.save(
                        event.ownerId(),
                        "Lead Expired",
                        "Request expired after 30 days."
                );
                break;
            default:
                log.warn("Unknown status: {}", status);
        }
    }
}