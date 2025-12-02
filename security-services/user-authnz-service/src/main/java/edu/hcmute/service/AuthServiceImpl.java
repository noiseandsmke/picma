package edu.hcmute.service;

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
    private static final String TOKEN_BLACKLIST_PREFIX = "TOKEN_BLACKLIST:";
    private static final String REFRESH_TOKEN_PREFIX = "REFRESH_TOKEN:";

    private final KeycloakAuthClient keycloakAuthClient;
    private final KeycloakProperties keycloakProperties;
    private final RedisTemplate<String, Object> redisTemplate;

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
        String sessionKey = USER_SESSION_PREFIX + request.username();
        redisTemplate.opsForValue().set(sessionKey, tokenResponse, tokenResponse.expiresIn(), TimeUnit.SECONDS);
        String refreshTokenKey = REFRESH_TOKEN_PREFIX + tokenResponse.refreshToken();
        Map<String, String> refreshTokenData = new HashMap<>();
        refreshTokenData.put("username", request.username());
        refreshTokenData.put("accessToken", tokenResponse.accessToken());
        redisTemplate.opsForValue().set(refreshTokenKey, refreshTokenData, tokenResponse.refreshExpiresIn(), TimeUnit.SECONDS);
        log.info("User {} logged in successfully with roles: {}", request.username(), roles);
        return tokenResponse;
    }

    @Override
    public TokenResponse refresh(String refreshToken, String oldAccessToken) {
        log.info("Refreshing token");
        if (oldAccessToken != null && !oldAccessToken.isEmpty()) {
            try {
                String jti = JwtUtil.getJtiFromToken(oldAccessToken);
                String blacklistKey = TOKEN_BLACKLIST_PREFIX + jti;
                redisTemplate.opsForValue().set(blacklistKey, "blacklisted", 1800, TimeUnit.SECONDS);
                log.info("Old access token blacklisted: {}", jti);
            } catch (Exception e) {
                log.warn("Failed to blacklist old token: {}", e.getMessage());
            }
        }
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
        List<String> roles = userInfo.realmAccess() != null && userInfo.realmAccess().roles() != null
                ? userInfo.realmAccess().roles()
                : Collections.emptyList();
        String sessionKey = USER_SESSION_PREFIX + userInfo.username();
        redisTemplate.opsForValue().set(sessionKey, tokenResponse, tokenResponse.expiresIn(), TimeUnit.SECONDS);
        String newRefreshTokenKey = REFRESH_TOKEN_PREFIX + tokenResponse.refreshToken();
        Map<String, String> refreshTokenData = new HashMap<>();
        refreshTokenData.put("username", userInfo.username());
        refreshTokenData.put("accessToken", tokenResponse.accessToken());
        redisTemplate.opsForValue().set(newRefreshTokenKey, refreshTokenData, tokenResponse.refreshExpiresIn(), TimeUnit.SECONDS);
        String oldRefreshTokenKey = REFRESH_TOKEN_PREFIX + refreshToken;
        redisTemplate.delete(oldRefreshTokenKey);
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
        String refreshTokenKey = REFRESH_TOKEN_PREFIX + refreshToken;
        redisTemplate.delete(refreshTokenKey);
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