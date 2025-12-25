package edu.hcmute.config;

import edu.hcmute.client.KeycloakAuthClient;
import edu.hcmute.dto.TokenResponse;
import feign.RequestInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@Slf4j
@RequiredArgsConstructor
public class KeycloakServiceAccountConfig {
    private final KeycloakAuthClient keycloakAuthClient;
    @Value("${keycloak.resource}")
    private String clientId;
    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            try {
                MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
                map.add("client_id", clientId);
                map.add("client_secret", clientSecret);
                map.add("grant_type", "client_credentials");
                TokenResponse response = keycloakAuthClient.getToken(map);
                if (response != null && response.accessToken() != null) {
                    template.header("Authorization", "Bearer " + response.accessToken());
                    log.debug("Attached Service Account token to request");
                } else {
                    log.error("Failed to retrieve access token: Response was null");
                }
            } catch (Exception e) {
                log.error("Error fetching service account token", e);
            }
        };
    }
}