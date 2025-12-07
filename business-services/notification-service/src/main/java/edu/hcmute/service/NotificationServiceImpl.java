package edu.hcmute.service;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.entity.Notification;
import edu.hcmute.mapper.NotificationMapper;
import edu.hcmute.repo.NotificationRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepo notificationRepo;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationDto createNotification(NotificationRequestDto requestDto) {
        log.info("### Creating notification for recipient: {}", requestDto.recipientId());
        NotificationDto notificationDto = new NotificationDto(
                null,
                requestDto.recipientId(),
                requestDto.title(),
                requestDto.message(),
                false,
                null
        );
        Notification notification = notificationMapper.toEntity(notificationDto);
        notification = notificationRepo.save(notification);
        return notificationMapper.toDto(notification);
    }

    @Override
    public List<NotificationDto> getNotifications(String recipientId) {
        log.info("### Fetching notifications for recipient: {}", recipientId);
        List<Notification> notifications = notificationRepo.findByRecipientIdOrderByCreatedAtDesc(recipientId);
        return notifications.stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationDto markAsRead(Integer notificationId) {
        log.info("### Marking notification {} as read", notificationId);
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notification = notificationRepo.save(notification);
        return notificationMapper.toDto(notification);
    }

    @Override
    public long getUnreadCount(String recipientId) {
        return notificationRepo.countByRecipientIdAndIsReadFalse(recipientId);
    }
}