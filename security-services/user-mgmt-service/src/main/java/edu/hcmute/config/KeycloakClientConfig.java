package edu.hcmute.config;

import edu.hcmute.outbound.KeycloakRequestInterceptor;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;

public class KeycloakClientConfig {
    @Bean
    public RequestInterceptor requestInterceptor() {
        return new KeycloakRequestInterceptor();
    }
}