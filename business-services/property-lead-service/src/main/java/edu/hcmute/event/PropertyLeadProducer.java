package edu.hcmute.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.event.schema.LeadCreatedEvent;
import edu.hcmute.event.schema.LeadStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

@Component
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${picma.leads.created.topic:picma.leads.created}")
    private String leadCreatedTopic;
    @Value("${picma.leads.status.topic:picma.leads.status}")
    private String leadStatusTopic;

    public boolean publishLeadCreated(PropertyLead propertyLead) {
        log.info("Sending LeadCreatedEvent to topic: {}", leadCreatedTopic);
        try {
            LeadCreatedEvent event = new LeadCreatedEvent(
                    propertyLead.getId(),
                    propertyLead.getPropertyInfo(),
                    propertyLead.getUserInfo(), "N/A", LocalDateTime.now()
            );
            String key = propertyLead.getPropertyInfo();
            String value = objectMapper.writeValueAsString(event);
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(leadCreatedTopic, key, value);
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("LeadCreatedEvent sent successfully for leadId: {}", propertyLead.getId());
                } else {
                    log.error("Failed to send LeadCreatedEvent", ex);
                }
            });
            return true;
        } catch (Exception e) {
            log.error("Error publishing LeadCreatedEvent: {}", e.getLocalizedMessage());
            return false;
        }
    }

    public void publishLeadStatusChanged(Integer leadId, String oldStatus, String newStatus) {
        log.info("Sending LeadStatusChangedEvent to topic: {}", leadStatusTopic);
        try {
            LeadStatusChangedEvent event = new LeadStatusChangedEvent(
                    leadId,
                    oldStatus,
                    newStatus,
                    null, null, LocalDateTime.now()
            );
            String key = String.valueOf(leadId);
            String value = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(leadStatusTopic, key, value);
        } catch (Exception e) {
            log.error("Error publishing LeadStatusChangedEvent: {}", e.getLocalizedMessage());
        }
    }

    public boolean publishLead(PropertyLead propertyLead) {
        return publishLeadCreated(propertyLead);
    }
}