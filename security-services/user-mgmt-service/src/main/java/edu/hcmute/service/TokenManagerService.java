package edu.hcmute.service;

import edu.hcmute.dto.TokenResponse;
import edu.hcmute.outbound.KeycloakAuthClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenManagerService {
    private final KeycloakAuthClient keycloakAuthClient;
    @Value("${spring.security.oauth2.client.registration.keycloak-admin.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.keycloak-admin.client-secret}")
    private String clientSecret;

    public String getSystemToken() {
        log.info("Fetching new system token from Keycloak");
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "client_credentials");
        try {
            TokenResponse tokenResponse = keycloakAuthClient.getToken(body);
            if (tokenResponse != null) {
                return tokenResponse.accessToken();
            } else {
                throw new RuntimeException("Failed to retrieve access token: Response is null");
            }
        } catch (Exception e) {
            log.error("Error fetching system token", e);
            throw new RuntimeException("Error fetching system token: " + e.getMessage());
        }
    }
}