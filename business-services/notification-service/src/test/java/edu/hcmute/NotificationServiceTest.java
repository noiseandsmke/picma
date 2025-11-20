package edu.hcmute;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.service.NotificationService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public class NotificationServiceTest extends NotificationServiceApplicationTests {
    @Autowired
    private NotificationService notificationService;
    private NotificationRequestDto notificationRequestDto;
    private Integer testRecipientId = 106;

    @BeforeEach
    public void setUp() {
        notificationRequestDto = new NotificationRequestDto();
        notificationRequestDto.setRecipientId(testRecipientId);
        notificationRequestDto.setTitle("Test Notification");
        notificationRequestDto.setMessage("This is a test notification message");
    }

    @Test
    public void testCreateNotification() {
        NotificationRequestDto request = NotificationRequestDto.builder()
                .recipientId(testRecipientId)
                .title("New Lead Available")
                .message("A new lead matches your zip code: 12345")
                .build();
        NotificationDto createdNotification = notificationService.createNotification(request);
        Assertions.assertNotNull(createdNotification);
        Assertions.assertNotNull(createdNotification.getId());
        Assertions.assertEquals(testRecipientId, createdNotification.getRecipientId());
        Assertions.assertEquals("New Lead Available", createdNotification.getTitle());
        Assertions.assertEquals("A new lead matches your zip code: 12345", createdNotification.getMessage());
        Assertions.assertFalse(createdNotification.isRead());
        Assertions.assertNotNull(createdNotification.getCreatedAt());
    }

    @Test
    public void testGetNotifications() {
        notificationService.createNotification(notificationRequestDto);
        List<NotificationDto> notifications = notificationService.getNotifications(testRecipientId);
        Assertions.assertNotNull(notifications);
        Assertions.assertFalse(notifications.isEmpty());
        Assertions.assertEquals(testRecipientId, notifications.get(0).getRecipientId());
    }

    @Test
    public void testMarkAsRead() {
        NotificationDto createdNotification = notificationService.createNotification(notificationRequestDto);
        Assertions.assertFalse(createdNotification.isRead());
        NotificationDto updatedNotification = notificationService.markAsRead(createdNotification.getId());
        Assertions.assertNotNull(updatedNotification);
        Assertions.assertTrue(updatedNotification.isRead());
        Assertions.assertEquals(createdNotification.getId(), updatedNotification.getId());
    }

    @Test
    public void testGetUnreadCount() {
        notificationService.createNotification(notificationRequestDto);
        NotificationDto notification2 = notificationService.createNotification(notificationRequestDto);
        long unreadCount = notificationService.getUnreadCount(testRecipientId);
        Assertions.assertTrue(unreadCount >= 2);
        notificationService.markAsRead(notification2.getId());
        long newUnreadCount = notificationService.getUnreadCount(testRecipientId);
        Assertions.assertEquals(unreadCount - 1, newUnreadCount);
    }
}