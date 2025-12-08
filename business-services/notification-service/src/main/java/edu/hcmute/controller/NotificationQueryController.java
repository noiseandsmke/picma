package edu.hcmute.controller;

import edu.hcmute.dto.NotificationDto;
import edu.hcmute.service.NotificationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}