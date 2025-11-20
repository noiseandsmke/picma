package edu.hcmute.controller;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(@RequestBody NotificationRequestDto requestDto) {
        return ResponseEntity.ok(notificationService.createNotification(requestDto));
    }

    @GetMapping("/{recipientId}")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable Integer recipientId) {
        return ResponseEntity.ok(notificationService.getNotifications(recipientId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Integer id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @GetMapping("/{recipientId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Integer recipientId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(recipientId));
    }
}