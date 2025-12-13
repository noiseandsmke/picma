package edu.hcmute.event.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {
    private final SseService sseService;
    private final ObjectMapper objectMapper;

    @Bean
    public Consumer<String> handleNotification() {
        return message -> {
            log.info("Received notification message: {}", message);
            try {
                NotificationRequestDto notification = objectMapper.readValue(message, NotificationRequestDto.class);
                sseService.sendNotification(notification.recipientId(), notification);
            } catch (Exception e) {
                log.error("Error processing notification event: {}", e.getMessage(), e);
            }
        };
    }
}