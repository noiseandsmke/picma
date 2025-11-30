package edu.hcmute.service;

import edu.hcmute.dto.TokenResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class TokenManagerService {
    private static final String REDIS_KEY_SYS_ADMIN_TOKEN = "sys_admin_token";
    private final RestTemplate restTemplate;
    private final StringRedisTemplate redisTemplate;
    
    @Value("${spring.security.oauth2.client.registration.keycloak-admin.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.keycloak-admin.client-secret}")
    private String clientSecret;
    @Value("${spring.security.oauth2.client.provider.keycloak.token-uri}")
    private String tokenUri;

    public TokenManagerService(RestTemplate restTemplate, StringRedisTemplate redisTemplate) {
        this.restTemplate = restTemplate;
        this.redisTemplate = redisTemplate;
    }

    public String getSystemToken() {
        String cachedToken = redisTemplate.opsForValue().get(REDIS_KEY_SYS_ADMIN_TOKEN);
        if (cachedToken != null) {
            log.debug("Using cached system token from Redis");
            return cachedToken;
        }
        log.info("Fetching new system token from Keycloak");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "client_credentials");
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<TokenResponse> response = restTemplate.postForEntity(tokenUri, request, TokenResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                TokenResponse tokenResponse = response.getBody();
                String accessToken = tokenResponse.accessToken();
                long expiresIn = tokenResponse.expiresIn();
                if (expiresIn > 0) {
                    redisTemplate.opsForValue().set(REDIS_KEY_SYS_ADMIN_TOKEN, accessToken, expiresIn, TimeUnit.SECONDS);
                }
                return accessToken;
            } else {
                throw new RuntimeException("Failed to retrieve access token: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error fetching system token", e);
            throw new RuntimeException("Error fetching system token: " + e.getMessage());
        }
    }
}