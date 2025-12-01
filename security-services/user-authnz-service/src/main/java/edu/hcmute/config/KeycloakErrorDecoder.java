package edu.hcmute.config;

import edu.hcmute.exception.AuthException;
import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class KeycloakErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        String message = "Unknown error";
        try {
            if (response.body() != null) {
                message = StreamUtils.copyToString(response.body().asInputStream(), StandardCharsets.UTF_8);
            }
        } catch (IOException ignored) {
        }
        return new AuthException("Keycloak error: " + message, response.status());
    }
}