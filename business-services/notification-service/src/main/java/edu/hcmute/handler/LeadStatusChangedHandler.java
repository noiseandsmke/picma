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
                        "Agent Reviewing Your Request",
                        String.format("An insurance agent is reviewing your property for Lead #%d. You'll receive a quote soon.", event.leadId())
                );
                break;
            case "ACCEPTED":
                notificationPersistenceService.save(
                        event.ownerId(),
                        "Lead Successfully Completed",
                        String.format("Your lead #%d has been accepted. The insurance process is now complete.", event.leadId())
                );
                break;
            case "REJECTED":
                notificationPersistenceService.save(
                        event.ownerId(),
                        "Lead Not Accepted",
                        String.format("Unfortunately, no agents are available for Lead #%d. Please try expanding your search area or adjusting property details.", event.leadId())
                );
                break;
            case "EXPIRED":
                notificationPersistenceService.save(
                        event.ownerId(),
                        "Lead Expired",
                        String.format("Your insurance request Lead #%d has expired after 30 days of inactivity. Create a new request to continue.", event.leadId())
                );
                break;
            default:
                log.warn("Unknown status: {}", status);
        }
    }
}