package edu.hcmute.config;

import org.javers.spring.auditable.AuthorProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JaversConfig {
    @Bean
    public AuthorProvider authorProvider() {
        return () -> "unknown";
    }
}