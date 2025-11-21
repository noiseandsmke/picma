package edu.hcmute.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationListener {
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${picma.notifications.topic}")
    public void listen(String message) {
        log.info("Received notification message: {}", message);
        try {
            NotificationRequestDto requestDto = objectMapper.readValue(message, NotificationRequestDto.class);
            notificationService.createNotification(requestDto);
            log.info("Notification created for recipient: {}", requestDto.getRecipientId());
        } catch (JsonProcessingException e) {
            log.error("Error processing notification message: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
        }
    }
}