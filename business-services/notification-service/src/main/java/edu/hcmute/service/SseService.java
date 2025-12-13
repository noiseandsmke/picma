package edu.hcmute.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SseService {
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);
        emitter.onCompletion(() -> {
            emitters.remove(userId);
            log.info("Emitter completed for user: {}", userId);
        });
        emitter.onTimeout(() -> {
            emitters.remove(userId);
            log.info("Emitter timed out for user: {}", userId);
        });
        emitter.onError(e -> {
            emitters.remove(userId);
            log.error("Emitter error for user: {}", userId, e);
        });
        log.info("User subscribed to SSE: {}", userId);
        return emitter;
    }

    public void sendNotification(String userId, Object payload) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(payload));
                log.info("Sent SSE notification to user: {}", userId);
            } catch (IOException e) {
                log.error("Error sending SSE to user: {}", userId, e);
                emitters.remove(userId);
            }
        } else {
            log.debug("User {} not connected to SSE, skipping real-time notification.", userId);
        }
    }
}