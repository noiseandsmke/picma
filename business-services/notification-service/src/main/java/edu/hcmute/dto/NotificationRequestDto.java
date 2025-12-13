package edu.hcmute.dto;

import java.io.Serializable;

public record NotificationRequestDto(
        String recipientId,
        String title,
        String message
) implements Serializable {
}
