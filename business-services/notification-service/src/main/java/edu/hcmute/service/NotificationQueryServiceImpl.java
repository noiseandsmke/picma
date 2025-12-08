package edu.hcmute.service;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.entity.Notification;
import edu.hcmute.mapper.NotificationMapper;
import edu.hcmute.repo.NotificationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationQueryServiceImpl implements NotificationQueryService {
    private final NotificationRepo notificationRepo;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(String recipientId) {
        List<Notification> notifications = notificationRepo.findByRecipientIdOrderByCreatedAtDesc(recipientId);
        return notifications.stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(Integer notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        Notification savedNotification = notificationRepo.save(notification);
        return notificationMapper.toDto(savedNotification);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String recipientId) {
        return notificationRepo.countByRecipientIdAndReadFalse(recipientId);
    }
}