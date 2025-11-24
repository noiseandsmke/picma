package edu.hcmute.dto;

public record NotificationRequestDto(
        String recipientId,
        String title,
        String message
) {
}