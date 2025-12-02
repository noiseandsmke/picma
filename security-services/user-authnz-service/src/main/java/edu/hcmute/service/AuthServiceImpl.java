package edu.hcmute.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.RegisterRequest;
import edu.hcmute.dto.TokenResponse;
import edu.hcmute.dto.UserInfo;
import edu.hcmute.exception.AuthException;
import edu.hcmute.outbound.KeycloakAuthClient;
import edu.hcmute.outbound.KeycloakProperties;
import edu.hcmute.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private static final String USER_SESSION_PREFIX = "USER_SESSION:";

    private final KeycloakAuthClient keycloakAuthClient;
    private final KeycloakProperties keycloakProperties;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public TokenResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.username());
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("username", request.username());
        map.add("password", request.password());
        map.add("grant_type", "password");
        map.add("scope", "openid");
        TokenResponse tokenResponse = keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
        if (tokenResponse == null) {
            throw new AuthException("Failed to obtain token from Keycloak", 401);
        }
        UserInfo userInfo = JwtUtil.parseJwt(tokenResponse.accessToken());
        List<String> roles = userInfo.realmAccess() != null && userInfo.realmAccess().roles() != null
                ? userInfo.realmAccess().roles()
                : Collections.emptyList();
        try {
            String sessionKey = USER_SESSION_PREFIX + request.username();
            String sessionJson = objectMapper.writeValueAsString(tokenResponse);
            redisTemplate.opsForValue().set(sessionKey, sessionJson, tokenResponse.expiresIn(), TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Error serializing token to redis", e);
            throw new AuthException("Failed to store session", 500);
        }
        log.info("User {} logged in successfully with roles: {}", request.username(), roles);
        return tokenResponse;
    }

    @Override
    public TokenResponse refresh(String refreshToken, String oldAccessToken) {
        log.info("Refreshing token");
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("grant_type", "refresh_token");
        map.add("refresh_token", refreshToken);
        TokenResponse tokenResponse = keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
        if (tokenResponse == null) {
            throw new AuthException("Failed to refresh token", 401);
        }
        UserInfo userInfo = JwtUtil.parseJwt(tokenResponse.accessToken());
        try {
            String sessionKey = USER_SESSION_PREFIX + userInfo.username();
            String sessionJson = objectMapper.writeValueAsString(tokenResponse);
            redisTemplate.opsForValue().set(sessionKey, sessionJson, tokenResponse.expiresIn(), TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Error serializing token to redis", e);
            throw new AuthException("Failed to store session", 500);
        }
        log.info("Token refreshed successfully for user: {}", userInfo.username());
        return tokenResponse;
    }

    @Override
    public void logout(String refreshToken) {
        log.info("Logging out user");
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("refresh_token", refreshToken);
        keycloakAuthClient.logout(keycloakProperties.getRealm(), map);
        log.info("User logged out successfully");
    }

    @Override
    public void register(RegisterRequest request) {
        log.info("Registering new user: {}", request.username());
        String adminToken = getAdminToken();
        Map<String, Object> user = new HashMap<>();
        user.put("username", request.username());
        user.put("firstName", request.firstName());
        user.put("lastName", request.lastName());
        user.put("email", request.email());
        user.put("enabled", true);
        user.put("emailVerified", false);
        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", request.password());
        credential.put("temporary", false);
        user.put("credentials", Collections.singletonList(credential));
        keycloakAuthClient.createUser(keycloakProperties.getRealm(), "Bearer " + adminToken, user);
        log.info("User {} registered successfully", request.username());
    }

    private String getAdminToken() {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("grant_type", "client_credentials");
        TokenResponse response = keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
        if (response != null) {
            return response.accessToken();
        }
        throw new AuthException("Failed to obtain admin token", 500);
    }
}