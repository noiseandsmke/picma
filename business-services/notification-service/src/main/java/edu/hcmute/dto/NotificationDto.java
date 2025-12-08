package edu.hcmute.dto;

import java.time.LocalDateTime;

public record NotificationDto(
        Integer id,
        String recipientId,
        String title,
        String message,
        LocalDateTime createdAt
) {
}