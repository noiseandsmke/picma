package edu.hcmute.config;

import edu.hcmute.exception.AuthException;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
public class KeycloakClientConfig {
    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            String message = "Unknown error";
            try {
                if (response.body() != null) {
                    message = StreamUtils.copyToString(response.body().asInputStream(), StandardCharsets.UTF_8);
                }
            } catch (IOException e) {
                log.warn("Failed to read error response body from Keycloak: {}", e.getMessage());
                message = "Failed to read error response";
            }
            return new AuthException("Keycloak error: " + message, response.status());
        };
    }
}