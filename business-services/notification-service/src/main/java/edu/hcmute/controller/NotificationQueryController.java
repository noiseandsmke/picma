package edu.hcmute.controller;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.service.NotificationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationQueryController {
    private final NotificationQueryService notificationQueryService;

    @GetMapping("/{recipientId}")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable String recipientId) {
        return ResponseEntity.ok(notificationQueryService.getNotifications(recipientId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Integer id) {
        return ResponseEntity.ok(notificationQueryService.markAsRead(id));
    }

    @GetMapping("/{recipientId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String recipientId) {
        return ResponseEntity.ok(notificationQueryService.getUnreadCount(recipientId));
    }
}