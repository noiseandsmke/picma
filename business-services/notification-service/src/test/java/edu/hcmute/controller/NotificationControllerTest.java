package edu.hcmute.controller;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    @Test
    void createNotification_shouldReturnCreatedNotification() {
        NotificationRequestDto requestDto = new NotificationRequestDto("rec1", "Title", "Message");
        NotificationDto notificationDto = new NotificationDto(1, "rec1", "Title", "Message", false, null);
        when(notificationService.createNotification(any(NotificationRequestDto.class))).thenReturn(notificationDto);
        ResponseEntity<NotificationDto> response = notificationController.createNotification(requestDto);
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(notificationDto, response.getBody());
        verify(notificationService).createNotification(requestDto);
    }

    @Test
    void getNotifications_shouldReturnListOfNotifications() {
        String recipientId = "rec1";
        NotificationDto notificationDto = new NotificationDto(1, recipientId, "Title", "Message", false, null);
        List<NotificationDto> notificationList = Collections.singletonList(notificationDto);
        when(notificationService.getNotifications(recipientId)).thenReturn(notificationList);
        ResponseEntity<List<NotificationDto>> response = notificationController.getNotifications(recipientId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(notificationList, response.getBody());
        verify(notificationService).getNotifications(recipientId);
    }

    @Test
    void markAsRead_shouldReturnUpdatedNotification() {
        Integer notificationId = 1;
        NotificationDto notificationDto = new NotificationDto(notificationId, "rec1", "Title", "Message", true, null);
        when(notificationService.markAsRead(notificationId)).thenReturn(notificationDto);
        ResponseEntity<NotificationDto> response = notificationController.markAsRead(notificationId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(notificationDto, response.getBody());
        verify(notificationService).markAsRead(notificationId);
    }

    @Test
    void getUnreadCount_shouldReturnCount() {
        String recipientId = "rec1";
        Long count = 5L;
        when(notificationService.getUnreadCount(recipientId)).thenReturn(count);
        ResponseEntity<Long> response = notificationController.getUnreadCount(recipientId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(count, response.getBody());
        verify(notificationService).getUnreadCount(recipientId);
    }
}