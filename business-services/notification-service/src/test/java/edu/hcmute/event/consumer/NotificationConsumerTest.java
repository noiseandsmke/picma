package edu.hcmute.event.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.service.SseService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.function.Consumer;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationConsumerTest {
    @Mock
    private SseService sseService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotificationConsumer notificationConsumer;

    @Test
    void testHandleNotification() throws Exception {
        String jsonInfo = "{\"recipientId\":\"agent123\",\"title\":\"Test Title\",\"message\":\"Test Message\"}";
        NotificationRequestDto dto = new NotificationRequestDto("agent123", "Test Title", "Test Message");
        org.mockito.Mockito.when(objectMapper.readValue(jsonInfo, NotificationRequestDto.class)).thenReturn(dto);
        Consumer<String> consumer = notificationConsumer.handleNotification();
        consumer.accept(jsonInfo);
        verify(sseService).sendNotification(eq("agent123"), eq(dto));
    }
}