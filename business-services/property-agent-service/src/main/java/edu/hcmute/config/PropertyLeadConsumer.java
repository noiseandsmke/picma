package edu.hcmute.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.service.PropertyAgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadConsumer {
    private final ObjectMapper objectMapper;
    private final PropertyAgentService propertyAgentService;

    @KafkaListener(topics = "${picma.properties.lead.topic}")
    public void receiveLead(ConsumerRecord<String, String> record) {
        log.info("### Received lead record: {} ###", record.value());
        String value = record.value();
        try {
            PropertyLead propertyLead = objectMapper.readValue(value.getBytes(), PropertyLead.class);
            log.info("Received lead: {}", propertyLead);
            propertyAgentService.fetchAgentWithinZipCode(propertyLead.getPropertyInfo());
        } catch (Exception e) {
            log.error(e.getLocalizedMessage());
        }
    }
}