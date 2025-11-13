package edu.hcmute.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.entity.PropertyLead;
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

    @KafkaListener(topics = "${picma.properties.lead.topic}")
    public void receiveLead(ConsumerRecord<String, String> record) {
        log.info("### Received lead record: {} ###", record.value());
        String value = record.value();
        try {
            PropertyLead propertyLead = objectMapper.readValue(value.getBytes(), PropertyLead.class);
            log.info("Received lead: {}", propertyLead);
            // TODO: 1 - call property-info-api => address info
            // TODO: 2 - pull all agents within zipcode as property lead
            // TODO: 3 - send notification to all agents with property lead
        } catch (Exception e) {
            log.error(e.getLocalizedMessage());
        }
    }
}