package edu.hcmute.service;

import edu.hcmute.client.KeycloakAdminClient;
import edu.hcmute.client.KeycloakAuthClient;
import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.RegisterRequest;
import edu.hcmute.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAuthnzServiceImpl implements UserAuthnzService {
    private static final String CLIENT_ID = "client_id";
    private static final String CLIENT_SECRET = "client_secret";
    private static final String PASSWORD = "password";
    private static final String GRANT_TYPE = "grant_type";
    private static final String REFRESH_TOKEN = "refresh_token";

    private final KeycloakAuthClient keycloakAuthClient;
    private final KeycloakAdminClient keycloakAdminClient;

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
        log.info("### Login attempt for user: {} ###", request.username());
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(CLIENT_ID, resource);
        map.add(CLIENT_SECRET, clientSecret);
        map.add("username", request.username());
        map.add(PASSWORD, request.password());
        map.add(GRANT_TYPE, PASSWORD);
        map.add("scope", "openid");
        TokenResponse tokenResponse = keycloakAuthClient.getToken(map);
        if (tokenResponse == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Failed to obtain token from Keycloak");
        }
        return tokenResponse;
    }

    @Override
    public TokenResponse refresh(String refreshToken, String oldAccessToken) {
        log.info("### Refreshing token ###");
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(CLIENT_ID, resource);
        map.add(CLIENT_SECRET, clientSecret);
        map.add(GRANT_TYPE, REFRESH_TOKEN);
        map.add(REFRESH_TOKEN, refreshToken);
        TokenResponse tokenResponse = keycloakAuthClient.getToken(map);
        if (tokenResponse == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Failed to refresh token");
        }
        return tokenResponse;
    }

    @Override
    public void logout(String refreshToken) {
        log.info("### Logging out user ###");
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add(CLIENT_ID, resource);
        map.add(CLIENT_SECRET, clientSecret);
        map.add(REFRESH_TOKEN, refreshToken);
        keycloakAuthClient.logout(map);
    }

    @Override
    public void register(RegisterRequest request) {
        log.info("### Registering new user: {} ###", request.username());
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
        ResponseEntity<Void> response = keycloakAdminClient.createUser(user);
        try {
            if (response.getStatusCode().is2xxSuccessful()) {
                URI location = response.getHeaders().getLocation();
                if (location != null) {
                    String path = location.getPath();
                    String userId = path.substring(path.lastIndexOf('/') + 1);
                    String groupId = isZipcodeEmpty ? agentsGroupId : ownersGroupId;
                    keycloakAdminClient.joinGroup(userId, groupId);
                    log.info("~~> assigned user {} (id: {}) to group {}", request.username(), userId, groupId);
                } else {
                    log.error("~~> user created but Location header missing for {}", request.username());
                }
            } else {
                log.error("~~> failed to create user {}. Status: {}", request.username(), response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("~~> failed to assign group to user {}", request.username(), e);
        }
    }
}