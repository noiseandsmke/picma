package edu.hcmute.service;

import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.RegisterRequest;
import edu.hcmute.dto.TokenResponse;
import edu.hcmute.exception.AuthException;
import edu.hcmute.outbound.KeycloakAuthClient;
import edu.hcmute.outbound.KeycloakProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final KeycloakAuthClient keycloakAuthClient;
    private final KeycloakProperties keycloakProperties;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public TokenResponse login(LoginRequest request) {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("username", request.username());
        map.add("password", request.password());
        map.add("grant_type", "password");
        map.add("scope", "openid");
        TokenResponse tokenResponse = keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
        if (tokenResponse != null) {
            String cacheKey = "USER_SESSION:" + request.username();
            redisTemplate.opsForValue().set(cacheKey, tokenResponse, tokenResponse.expiresIn(), TimeUnit.SECONDS);
        }
        return tokenResponse;
    }

    @Override
    public TokenResponse refresh(String refreshToken) {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("grant_type", "refresh_token");
        map.add("refresh_token", refreshToken);
        return keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
    }

    @Override
    public void logout(String refreshToken) {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("refresh_token", refreshToken);
        keycloakAuthClient.logout(keycloakProperties.getRealm(), map);
    }

    @Override
    public void register(RegisterRequest request) {
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