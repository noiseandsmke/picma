package edu.hcmute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Integer id;
    private String recipientId;
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}