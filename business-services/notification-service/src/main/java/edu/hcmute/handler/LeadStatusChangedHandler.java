package edu.hcmute.handler;

import edu.hcmute.event.schema.LeadStatusChangedEvent;
import edu.hcmute.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeadStatusChangedHandler {
    private final SseService sseService;

    public void handle(LeadStatusChangedEvent event) {
        log.info("Handling LeadStatusChangedEvent for leadId: {}, newStatus: {}", event.leadId(), event.newStatus());
        String status = event.newStatus();
        if (status == null) return;
        
        String title = null;
        String message = null;

        switch (status.toUpperCase()) {
            case "IN_REVIEWING":
                title = "Agent Reviewing Your Request";
                message = String.format("An insurance agent is reviewing your property for Lead #%d. You'll receive a quote soon.", event.leadId());
                break;
            case "ACCEPTED":
                title = "Lead Successfully Completed";
                message = String.format("Your lead #%d has been accepted. The insurance process is now complete.", event.leadId());
                break;
            case "REJECTED":
                title = "Lead Not Accepted";
                message = String.format("Unfortunately, no agents are available for Lead #%d. Please try expanding your search area or adjusting property details.", event.leadId());
                break;
            case "EXPIRED":
                title = "Lead Expired";
                message = String.format("Your insurance request Lead #%d has expired after 30 days of inactivity. Create a new request to continue.", event.leadId());
                break;
            default:
                log.warn("Unknown status: {}", status);
        }

        if (title != null) {
            edu.hcmute.dto.NotificationRequestDto notification = new edu.hcmute.dto.NotificationRequestDto(
                    event.ownerId(),
                    title,
                    message
            );
            sseService.sendNotification(event.ownerId(), notification);
        }
    }
}