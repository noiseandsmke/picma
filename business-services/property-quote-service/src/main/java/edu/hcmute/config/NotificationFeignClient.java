package edu.hcmute.config;

import edu.hcmute.dto.NotificationRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${picma.properties.notification.base-uri}")
public interface NotificationFeignClient {
    @PostMapping("/notification")
    void createNotification(@RequestBody NotificationRequestDto notificationRequestDto);
}