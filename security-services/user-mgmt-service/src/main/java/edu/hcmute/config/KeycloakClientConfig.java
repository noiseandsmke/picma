package edu.hcmute.config;

import edu.hcmute.client.KeycloakAuthClient;
import feign.RequestInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class KeycloakClientConfig {
    private final KeycloakAuthClient keycloakAuthClient;
    @Value("${keycloak.resource}")
    private String clientId;
    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            try {
                Map<String, ?> params = Map.of(
                        "grant_type", "client_credentials",
                        "client_id", clientId,
                        "client_secret", clientSecret
                );
                Map<String, Object> response = keycloakAuthClient.getToken(params);
                String accessToken = (String) response.get("access_token");
                if (accessToken != null) {
                    template.header("Authorization", "Bearer " + accessToken);
                    log.debug("Attached Service Account token to request");
                } else {
                    log.error("Failed to retrieve access token: Response was null or missing access_token");
                }
            } catch (Exception e) {
                log.error("Error fetching service account token", e);
            }
        };
    }
}