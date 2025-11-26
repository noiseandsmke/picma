package edu.hcmute.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.entity.PropertyLead;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${picma.properties.lead.topic}")
    private String topicName;

    public boolean publishLead(PropertyLead propertyLead) {
        boolean isLeadSent = false;
        log.info("Sending property lead to kafka topic: {}", topicName);
        try {
            String key = propertyLead.getPropertyInfo();
            String value = objectMapper.writeValueAsString(propertyLead);
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topicName, key, value);
            SendResult<String, String> result = future.get();
            isLeadSent = result != null && result.getRecordMetadata() != null;
            log.info("Lead sent {}", isLeadSent ? "successful" : "failed");
        } catch (Exception e) {
            log.error("Error publishing lead to Kafka: {}", e.getLocalizedMessage());
        }
        return isLeadSent;
    }
}
