package edu.hcmute.config;

import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;

public class KeycloakClientConfig {
    @Bean
    public ErrorDecoder errorDecoder() {
        return new KeycloakErrorDecoder();
    }
}