package edu.hcmute.dto;

import java.util.List;

public record NotificationDto(
        List<EmailRequestDto> toList,
        String emailSubject,
        String emailContentType,
        int statusCode
) {
}