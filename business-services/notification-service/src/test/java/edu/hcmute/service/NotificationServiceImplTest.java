package edu.hcmute.service;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.entity.Notification;
import edu.hcmute.mapper.NotificationMapper;
import edu.hcmute.repo.NotificationRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceImplTest {

    @Mock
    private NotificationRepo notificationRepo;
    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void createNotification_success() {
        NotificationRequestDto requestDto = new NotificationRequestDto("rec1", "Title", "Message");
        Notification entity = new Notification();
        NotificationDto resultDto = new NotificationDto(1, "rec1", "Title", "Message", false, null);

        when(notificationMapper.toEntity(any(NotificationDto.class))).thenReturn(entity);
        when(notificationRepo.save(entity)).thenReturn(entity);
        when(notificationMapper.toDto(entity)).thenReturn(resultDto);

        NotificationDto result = notificationService.createNotification(requestDto);

        assertNotNull(result);
        assertEquals(1, result.id());
        verify(notificationRepo).save(entity);
    }

    @Test
    void getNotifications_success() {
        String recipientId = "rec1";
        Notification entity = new Notification();
        NotificationDto resultDto = new NotificationDto(1, recipientId, "Title", "Message", false, null);

        when(notificationRepo.findByRecipientIdOrderByCreatedAtDesc(recipientId)).thenReturn(Collections.singletonList(entity));
        when(notificationMapper.toDto(entity)).thenReturn(resultDto);

        List<NotificationDto> result = notificationService.getNotifications(recipientId);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void markAsRead_success() {
        Integer notificationId = 1;
        Notification entity = new Notification();
        entity.setRead(false);
        NotificationDto resultDto = new NotificationDto(notificationId, "rec1", "Title", "Message", true, null);

        when(notificationRepo.findById(notificationId)).thenReturn(Optional.of(entity));
        when(notificationRepo.save(entity)).thenReturn(entity);
        when(notificationMapper.toDto(entity)).thenReturn(resultDto);

        NotificationDto result = notificationService.markAsRead(notificationId);

        assertTrue(result.isRead());
        verify(notificationRepo).save(entity);
    }

    @Test
    void markAsRead_notFound() {
        Integer notificationId = 1;
        when(notificationRepo.findById(notificationId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> notificationService.markAsRead(notificationId));
    }

    @Test
    void getUnreadCount_success() {
        String recipientId = "rec1";
        long count = 5L;
        when(notificationRepo.countByRecipientIdAndIsReadFalse(recipientId)).thenReturn(count);

        long result = notificationService.getUnreadCount(recipientId);

        assertEquals(count, result);
    }
}