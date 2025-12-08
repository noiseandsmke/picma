package edu.hcmute.service;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.entity.Notification;
import edu.hcmute.mapper.NotificationMapper;
import edu.hcmute.repo.NotificationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
                .toList();
    }
}