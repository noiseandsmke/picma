package edu.hcmute.config;

import edu.hcmute.outbound.KeycloakRequestInterceptor;
import edu.hcmute.service.TokenManagerService;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;

public class KeycloakClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor(TokenManagerService tokenManagerService) {
        return new KeycloakRequestInterceptor(tokenManagerService);
    }
}