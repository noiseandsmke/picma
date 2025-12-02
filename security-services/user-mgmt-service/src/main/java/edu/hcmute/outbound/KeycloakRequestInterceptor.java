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
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            String tokenValue = jwt.getTokenValue();
            log.debug("Adding Bearer token from SecurityContext to Keycloak Admin API request");
            template.header("Authorization", "Bearer " + tokenValue);
        } else {
            log.warn("No JWT authentication found in SecurityContext. Request to Keycloak Admin API may fail.");
        }
    }
}