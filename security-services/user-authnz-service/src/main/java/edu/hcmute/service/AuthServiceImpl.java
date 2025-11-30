package edu.hcmute.service;

import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.RegisterRequest;
import edu.hcmute.dto.TokenResponse;
import edu.hcmute.exception.AuthException;
import edu.hcmute.outbound.KeycloakAuthClient;
import edu.hcmute.outbound.KeycloakProperties;
import feign.FeignException;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final KeycloakAuthClient keycloakAuthClient;
    private final KeycloakProperties keycloakProperties;

    public AuthServiceImpl(KeycloakAuthClient keycloakAuthClient, KeycloakProperties keycloakProperties) {
        this.keycloakAuthClient = keycloakAuthClient;
        this.keycloakProperties = keycloakProperties;
    }

    @Override
    public TokenResponse login(LoginRequest request) {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("grant_type", "password");
        map.add("username", request.username());
        map.add("password", request.password());
        try {
            return keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
        } catch (FeignException e) {
            throw new AuthException("Login failed: " + e.contentUTF8(), e.status());
        }
    }

    @Override
    public TokenResponse refresh(String refreshToken) {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("grant_type", "refresh_token");
        map.add("refresh_token", refreshToken);
        try {
            return keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
        } catch (FeignException e) {
            throw new AuthException("Refresh token failed: " + e.contentUTF8(), e.status());
        }
    }

    @Override
    public void logout(String refreshToken) {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("refresh_token", refreshToken);
        try {
            keycloakAuthClient.logout(keycloakProperties.getRealm(), map);
        } catch (FeignException e) {
            throw new AuthException("Logout failed: " + e.contentUTF8(), e.status());
        }
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
        try {
            keycloakAuthClient.createUser(keycloakProperties.getRealm(), "Bearer " + adminToken, user);
        } catch (FeignException e) {
            throw new AuthException("Failed to register user: " + e.contentUTF8(), e.status());
        }
    }

    private String getAdminToken() {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", keycloakProperties.getResource());
        map.add("client_secret", keycloakProperties.getCredentials().getSecret());
        map.add("grant_type", "client_credentials");
        try {
            TokenResponse response = keycloakAuthClient.getToken(keycloakProperties.getRealm(), map);
            if (response != null) {
                return response.accessToken();
            }
        } catch (FeignException e) {
            throw new AuthException("Failed to obtain admin token: " + e.contentUTF8(), e.status());
        }
        throw new AuthException("Failed to obtain admin token", 500);
    }
}