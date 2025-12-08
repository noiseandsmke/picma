package edu.hcmute.service;

import edu.hcmute.dto.NotificationDto;

import java.util.List;

public interface NotificationQueryService {
    List<NotificationDto> getNotifications(String recipientId);

    NotificationDto markAsRead(Integer notificationId);

    long getUnreadCount(String recipientId);
}