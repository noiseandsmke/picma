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
            String message = null;
            try {
                if (response.body() != null) {
                    message = StreamUtils.copyToString(response.body().asInputStream(), StandardCharsets.UTF_8);
                }
            } catch (IOException e) {
                log.warn("Failed to read error response body from Keycloak: {}", e.getMessage());
            }
            log.info("{}: {}", methodKey, message);
            if (message == null || message.trim().isEmpty()) {
                if (response.status() == 401) {
                    message = "Invalid username or password";
                } else if (response.status() == 404) {
                    message = "User not found";
                } else {
                    message = "Unknown error";
                }
            } else if (message.contains("invalid_grant")) {
                message = "Invalid username or password";
            }
            return new AuthException("Keycloak error: " + message, response.status());
        };
    }
}