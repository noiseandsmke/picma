package edu.hcmute.outbound;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Slf4j
public class KeycloakRequestInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String tokenValue = jwt.getTokenValue();
            log.info("Adding Bearer token from SecurityContext to Keycloak Admin API request. User: {}", authentication.getName());
            template.header("Authorization", "Bearer " + tokenValue);
        } else if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            String tokenValue = jwt.getTokenValue();
            log.info("Adding Bearer token from SecurityContext (JwtAuthenticationToken) to Keycloak Admin API request. User: {}", authentication.getName());
            template.header("Authorization", "Bearer " + tokenValue);
        } else {
            String authClass = (authentication != null) ? authentication.getClass().getName() : "null";
            log.warn("No JWT authentication found in SecurityContext. Auth class: {}. Request to Keycloak Admin API may fail.", authClass);
        }
    }
}