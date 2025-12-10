package edu.hcmute.service;

import edu.hcmute.client.PropertyLeadClient;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.entity.OwnerHistory;
import edu.hcmute.event.schema.LeadStatusChangedEvent;
import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.repo.OwnerHistoryRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OwnerServiceImpl implements OwnerService {
    private final PropertyLeadClient propertyLeadClient;
    private final OwnerHistoryRepo ownerHistoryRepo;

    public void updateOwnerHistory(LeadStatusChangedEvent event) {
        log.info("Updating owner history for leadId: {}", event.leadId());
        saveHistory(event.leadId(), event.newStatus(), event.reason());
    }

    public void handleQuoteAccepted(QuoteAcceptedEvent event) {
        log.info("Handling Quote Accepted for leadId: {}", event.leadId());
        saveHistory(event.leadId(), "ACCEPTED", "Quote Accepted by Owner");
    }

    public void handleQuoteRejected(QuoteRejectedEvent event) {
        log.info("Handling Quote Rejected for leadId: {}", event.leadId());
        saveHistory(event.leadId(), "IN_REVIEWING", "Quote Rejected by Owner");
    }

    private void saveHistory(Integer leadId, String status, String reason) {
        try {
            PropertyLeadDto lead = propertyLeadClient.getLeadById(leadId);
            if (lead != null) {
                String ownerId = lead.userInfo();
                String propertyId = lead.propertyInfo();
                OwnerHistory history = OwnerHistory.builder()
                        .ownerId(ownerId)
                        .leadId(leadId)
                        .propertyId(propertyId)
                        .status(status)
                        .reason(reason)
                        .updatedAt(LocalDateTime.now())
                        .build();
                ownerHistoryRepo.save(history);
                log.info("Owner history updated for ownerId: {}, status: {}", ownerId, status);
            } else {
                log.warn("Lead not found for id: {}", leadId);
            }
        } catch (Exception e) {
            log.error("Error updating owner history: {}", e.getMessage(), e);
        }
    }
}