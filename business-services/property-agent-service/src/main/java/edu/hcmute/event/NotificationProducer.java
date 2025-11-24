package edu.hcmute.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.NotificationRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${picma.notifications.topic}")
    private String topicName;

    public void sendNotification(NotificationRequestDto notification) {
        log.info("Sending notification to kafka topic: {}", topicName);
        try {
            String value = objectMapper.writeValueAsString(notification);
            String key = notification.recipientId();
            kafkaTemplate.send(topicName, key, value);
            log.info("Notification sent to Kafka for recipient: {}", key);
        } catch (JsonProcessingException e) {
            log.error("Error serializing notification: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error sending notification to Kafka: {}", e.getMessage(), e);
        }
    }
}