package edu.hcmute.service;

import edu.hcmute.dto.TokenResponse;
import edu.hcmute.outbound.KeycloakAuthClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class TokenManagerService {
    private static final String REDIS_KEY_SYS_ADMIN_TOKEN = "sys_admin_token";
    private final KeycloakAuthClient keycloakAuthClient;
    private final StringRedisTemplate redisTemplate;

    @Value("${spring.security.oauth2.client.registration.keycloak-admin.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.keycloak-admin.client-secret}")
    private String clientSecret;

    public TokenManagerService(KeycloakAuthClient keycloakAuthClient, StringRedisTemplate redisTemplate) {
        this.keycloakAuthClient = keycloakAuthClient;
        this.redisTemplate = redisTemplate;
    }

    public String getSystemToken() {
        String cachedToken = redisTemplate.opsForValue().get(REDIS_KEY_SYS_ADMIN_TOKEN);
        if (cachedToken != null) {
            log.debug("Using cached system token from Redis");
            return cachedToken;
        }
        log.info("Fetching new system token from Keycloak");
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "client_credentials");
        try {
            TokenResponse tokenResponse = keycloakAuthClient.getToken(body);
            if (tokenResponse != null) {
                String accessToken = tokenResponse.accessToken();
                long expiresIn = tokenResponse.expiresIn();
                if (expiresIn > 0) {
                    redisTemplate.opsForValue().set(REDIS_KEY_SYS_ADMIN_TOKEN, accessToken, expiresIn, TimeUnit.SECONDS);
                }
                return accessToken;
            } else {
                throw new RuntimeException("Failed to retrieve access token: Response is null");
            }
        } catch (Exception e) {
            log.error("Error fetching system token", e);
            throw new RuntimeException("Error fetching system token: " + e.getMessage());
        }
    }
}