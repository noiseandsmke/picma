package edu.hcmute;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.entity.Notification;
import edu.hcmute.mapper.NotificationMapper;
import edu.hcmute.repo.NotificationRepo;
import edu.hcmute.service.NotificationServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {
    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Mock
    private NotificationRepo notificationRepo;

    @Mock
    private NotificationMapper notificationMapper;

    private NotificationRequestDto notificationRequestDto;
    private Notification notification;
    private NotificationDto notificationDto;
    private String testRecipientId = "106";

    @BeforeEach
    public void setUp() {
        notificationRequestDto = new NotificationRequestDto();
        notificationRequestDto.setRecipientId(testRecipientId);
        notificationRequestDto.setTitle("Test Notification");
        notificationRequestDto.setMessage("This is a test notification message");
        notification = Notification.builder()
                .id(1)
                .recipientId(testRecipientId)
                .title("Test Notification")
                .message("This is a test notification message")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationDto = new NotificationDto();
        notificationDto.setId(1);
        notificationDto.setRecipientId(testRecipientId);
        notificationDto.setTitle("Test Notification");
        notificationDto.setMessage("This is a test notification message");
        notificationDto.setRead(false);
        notificationDto.setCreatedAt(LocalDateTime.now());
    }

    @Test
    public void testCreateNotification() {
        when(notificationRepo.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toDto(any(Notification.class))).thenReturn(notificationDto);

        NotificationDto createdNotification = notificationService.createNotification(notificationRequestDto);

        Assertions.assertNotNull(createdNotification);
        Assertions.assertEquals(testRecipientId, createdNotification.getRecipientId());
    }

    @Test
    public void testGetNotifications() {
        when(notificationRepo.findByRecipientIdOrderByCreatedAtDesc(testRecipientId)).thenReturn(List.of(notification));
        when(notificationMapper.toDto(any(Notification.class))).thenReturn(notificationDto);

        List<NotificationDto> notifications = notificationService.getNotifications(testRecipientId);

        Assertions.assertNotNull(notifications);
        Assertions.assertFalse(notifications.isEmpty());
        Assertions.assertEquals(testRecipientId, notifications.get(0).getRecipientId());
    }

    @Test
    public void testMarkAsRead() {
        notification.setRead(true);
        notificationDto.setRead(true);
        when(notificationRepo.findById(1)).thenReturn(Optional.of(notification));
        when(notificationRepo.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toDto(any(Notification.class))).thenReturn(notificationDto);

        NotificationDto updatedNotification = notificationService.markAsRead(1);

        Assertions.assertNotNull(updatedNotification);
        Assertions.assertTrue(updatedNotification.isRead());
    }

    @Test
    public void testGetUnreadCount() {
        when(notificationRepo.countByRecipientIdAndIsReadFalse(testRecipientId)).thenReturn(1L);

        long unreadCount = notificationService.getUnreadCount(testRecipientId);

        Assertions.assertEquals(1, unreadCount);
    }
}