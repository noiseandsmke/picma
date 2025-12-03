package edu.hcmute.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.SessionData;
import edu.hcmute.dto.TokenResponse;
import edu.hcmute.outbound.KeycloakAuthClient;
import edu.hcmute.outbound.KeycloakProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenRefreshScheduler {
    private static final String USER_SESSION_PREFIX = "USER_SESSION:";

    private final RedisTemplate<String, String> redisTemplate;
    private final KeycloakAuthClient keycloakAuthClient;
    private final KeycloakProperties keycloakProperties;
    private final ObjectMapper objectMapper;

    @Value("${token.refresh.threshold-percentage:0.2}")
    private double thresholdPercentage;

    @Scheduled(fixedDelayString = "${token.refresh.interval:60000}")
    public void autoRefreshTokens() {
        log.info("Starting auto token refresh job (threshold: {}%)", thresholdPercentage * 100);
        try {
            Set<String> keys = redisTemplate.keys(USER_SESSION_PREFIX + "*");
            if (keys == null || keys.isEmpty()) {
                log.info("No active sessions found to refresh");
                return;
            }
            int refreshedCount = 0;
            int skippedCount = 0;
            int failedCount = 0;
            for (String key : keys) {
                try {
                    String sessionJson = redisTemplate.opsForValue().get(key);
                    if (sessionJson == null) {
                        log.warn("Session {} not found in Redis, skipping", key);
                        skippedCount++;
                        continue;
                    }
                    SessionData sessionData = objectMapper.readValue(sessionJson, SessionData.class);
                    TokenResponse oldToken = sessionData.tokenResponse();
                    if (oldToken.refreshToken() == null) {
                        log.warn("No refresh token for session {}, skipping", key);
                        skippedCount++;
                        continue;
                    }
                    long remainingSeconds = sessionData.getRemainingTimeSeconds();
                    double remainingPercentage = sessionData.getRemainingPercentage();
                    if (!sessionData.shouldRefresh(thresholdPercentage)) {
                        log.debug("Session {} has {:.1f}% time remaining ({} seconds), skipping",
                                key, remainingPercentage * 100, remainingSeconds);
                        skippedCount++;
                        continue;
                    }
                    log.info("Session {} has {:.1f}% time remaining ({} seconds), refreshing...",
                            key, remainingPercentage * 100, remainingSeconds);
                    TokenResponse newToken = refreshToken(oldToken.refreshToken());
                    if (newToken != null) {
                        SessionData newSessionData = SessionData.from(newToken);
                        String newSessionJson = objectMapper.writeValueAsString(newSessionData);
                        redisTemplate.opsForValue().set(
                                key,
                                newSessionJson,
                                newToken.expiresIn(),
                                TimeUnit.SECONDS
                        );
                        log.info("Successfully refreshed token for session {} with new TTL {} seconds",
                                key, newToken.expiresIn());
                        refreshedCount++;
                    } else {
                        log.error("Failed to refresh token for session {}", key);
                        failedCount++;
                    }
                } catch (Exception e) {
                    log.error("Error refreshing token for session {}: {}", key, e.getMessage(), e);
                    failedCount++;
                }
            }
            log.info("Auto token refresh completed: refreshed={}, skipped={}, failed={}",
                    refreshedCount, skippedCount, failedCount);
        } catch (Exception e) {
            log.error("Error during auto token refresh job: {}", e.getMessage(), e);
        }
    }

    private TokenResponse refreshToken(String refreshToken) {
        try {
            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("client_id", keycloakProperties.getResource());
            map.add("client_secret", keycloakProperties.getCredentials().getSecret());
            map.add("grant_type", "refresh_token");
            map.add("refresh_token", refreshToken);
            TokenResponse tokenResponse = keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
            return tokenResponse;
        } catch (Exception e) {
            log.error("Failed to refresh token from Keycloak: {}", e.getMessage());
            return null;
        }
    }
}