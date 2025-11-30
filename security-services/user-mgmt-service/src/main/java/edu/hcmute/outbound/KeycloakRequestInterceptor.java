package edu.hcmute.outbound;

import edu.hcmute.service.TokenManagerService;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;

@Component
public class KeycloakRequestInterceptor implements RequestInterceptor {

    private final TokenManagerService tokenManagerService;

    public KeycloakRequestInterceptor(TokenManagerService tokenManagerService) {
        this.tokenManagerService = tokenManagerService;
    }

    @Override
    public void apply(RequestTemplate template) {
        String token = tokenManagerService.getSystemToken();
        template.header("Authorization", "Bearer " + token);
    }
}