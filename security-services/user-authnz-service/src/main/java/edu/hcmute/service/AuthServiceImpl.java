package edu.hcmute.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.KeycloakAuthClient;
import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.RegisterRequest;
import edu.hcmute.dto.TokenResponse;
import edu.hcmute.dto.UserInfo;
import edu.hcmute.exception.AuthException;
import edu.hcmute.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private static final String USER_SESSION_PREFIX = "user:";
    private static final String CLIENT_ID = "client_id";
    private static final String CLIENT_SECRET = "client_secret";
    private static final String PASSWORD = "password";
    private static final String GRANT_TYPE = "grant_type";
    private static final String REFRESH_TOKEN = "refresh_token";

    private final KeycloakAuthClient keycloakAuthClient;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String resource;

    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    @Value("${picma.iam.groups.owners}")
    private String ownersGroupId;

    @Value("${picma.iam.groups.agents}")
    private String agentsGroupId;

    @Override
    public TokenResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.username());
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(CLIENT_ID, resource);
        map.add(CLIENT_SECRET, clientSecret);
        map.add("username", request.username());
        map.add(PASSWORD, request.password());
        map.add(GRANT_TYPE, PASSWORD);
        map.add("scope", "openid");
        TokenResponse tokenResponse = keycloakAuthClient.getToken(realm, map);
        if (tokenResponse == null) {
            throw new AuthException("Failed to obtain token from Keycloak", 401);
        }
        saveSessionToRedis(request.username(), tokenResponse);
        return tokenResponse;
    }

    @Override
    public TokenResponse refresh(String refreshToken, String oldAccessToken) {
        log.info("Refreshing token");
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(CLIENT_ID, resource);
        map.add(CLIENT_SECRET, clientSecret);
        map.add(GRANT_TYPE, REFRESH_TOKEN);
        map.add(REFRESH_TOKEN, refreshToken);
        TokenResponse tokenResponse = keycloakAuthClient.getToken(realm, map);
        if (tokenResponse == null) {
            throw new AuthException("Failed to refresh token", 401);
        }
        UserInfo userInfo = JwtUtil.parseJwt(tokenResponse.accessToken());
        saveSessionToRedis(userInfo.username(), tokenResponse);
        return tokenResponse;
    }

    @Override
    public void logout(String refreshToken) {
        log.info("Logging out user");
        try {
            String username = extractUsernameFromRefreshToken(refreshToken);
            if (username != null) {
                String sessionKey = USER_SESSION_PREFIX + username;
                redisTemplate.delete(sessionKey);
                log.info("Deleted session for user: {}", username);
            }
        } catch (Exception e) {
            log.warn("Failed to delete session from Redis: {}", e.getMessage());
        }
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(CLIENT_ID, resource);
        map.add(CLIENT_SECRET, clientSecret);
        map.add(REFRESH_TOKEN, refreshToken);
        keycloakAuthClient.logout(realm, map);
    }

    @Override
    public void register(RegisterRequest request) {
        log.info("Registering new user: {}", request.username());
        String adminToken = getAdminToken();
        Map<String, Object> user = new HashMap<>();
        user.put("username", request.username());
        user.put("enabled", true);
        user.put("emailVerified", true);
        user.put("firstName", request.firstName());
        user.put("lastName", request.lastName());
        user.put("email", request.email());
        boolean isZipcodeEmpty = request.zipcode() != null && !request.zipcode().isEmpty();
        if (isZipcodeEmpty) {
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("zipcode", Collections.singletonList(request.zipcode()));
            user.put("attributes", attributes);
        }
        Map<String, Object> credential = new HashMap<>();
        credential.put("type", PASSWORD);
        credential.put("value", request.password());
        credential.put("temporary", false);
        user.put("credentials", Collections.singletonList(credential));
        org.springframework.http.ResponseEntity<Void> response = keycloakAuthClient.createUser(realm, "Bearer " + adminToken, user);
        try {
            if (response.getStatusCode().is2xxSuccessful()) {
                URI location = response.getHeaders().getLocation();
                if (location != null) {
                    String path = location.getPath();
                    String userId = path.substring(path.lastIndexOf('/') + 1);
                    String groupId = isZipcodeEmpty ? agentsGroupId : ownersGroupId;
                    keycloakAuthClient.joinGroup(realm, "Bearer " + adminToken, userId, groupId);
                    log.info("Assigned user {} (id: {}) to group {}", request.username(), userId, groupId);
                } else {
                    log.error("User created but Location header missing for {}", request.username());
                }
            } else {
                log.error("Failed to create user {}. Status: {}", request.username(), response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Failed to assign group to user {}", request.username(), e);
        }
    }

    private void saveSessionToRedis(String username, TokenResponse tokenResponse) {
        try {
            String sessionKey = USER_SESSION_PREFIX + username;
            String tokenJson = objectMapper.writeValueAsString(tokenResponse);
            long ttl = tokenResponse.expiresIn();
            redisTemplate.opsForValue().set(sessionKey, tokenJson, ttl, TimeUnit.SECONDS);
        } catch (Exception e) {
            throw new AuthException("Failed to store session", 500);
        }
    }

    private String extractUsernameFromRefreshToken(String refreshToken) {
        try {
            UserInfo userInfo = JwtUtil.parseJwt(refreshToken);
            return userInfo.username();
        } catch (Exception e) {
            return null;
        }
    }

    private String getAdminToken() {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(CLIENT_ID, resource);
        map.add(CLIENT_SECRET, clientSecret);
        map.add(GRANT_TYPE, "client_credentials");
        TokenResponse response = keycloakAuthClient.getToken(realm, map);
        if (response != null) {
            return response.accessToken();
        }
        throw new AuthException("Failed to obtain admin token", 500);
    }
}