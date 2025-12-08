package edu.hcmute.service;

import edu.hcmute.entity.Notification;
import edu.hcmute.repo.NotificationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationPersistenceService {
    private final NotificationRepo notificationRepo;

    @Transactional
    public void save(String recipientId, String title, String message) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .title(title)
                .message(message)
                .build();
        notificationRepo.save(notification);
    }
}