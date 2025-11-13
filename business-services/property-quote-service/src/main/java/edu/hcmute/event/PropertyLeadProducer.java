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
    private String topicNam;
    @Value("${picma.properties.lead.partitions}")
    private Integer partitions;

    public boolean produceLead(PropertyLead propertyLead) {
        boolean isLeadSent = false;
        log.info("Sending property lead to kafka topic: {}", topicNam);
        log.info("NO. partitions = {}", partitions);
        try {
            String key = propertyLead.getPropertyInfo();
            log.info("Producing lead key = {}", key);
            String value = objectMapper.writeValueAsString(propertyLead);
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topicNam, key, value);
            isLeadSent = future.complete(future.get());
            log.info("Current status = {} : {} : {}", future.isDone(), future.isCancelled(), future.isCompletedExceptionally());
            log.info("Lead sent {}", isLeadSent ? "successful" : "failed");
        } catch (Exception e) {
            log.error(e.getLocalizedMessage());
        }
        return isLeadSent;
    }
}