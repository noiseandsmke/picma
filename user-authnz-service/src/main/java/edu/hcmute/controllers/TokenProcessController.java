package edu.hcmute.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
public class TokenProcessController {
    private OAuth2AuthorizedClientService authorizedClientService;

    public TokenProcessController(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    @GetMapping("/token")
    public Map<String, String> generateToken(OAuth2AuthenticationToken authentication) {
        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(authentication.getAuthorizedClientRegistrationId(), authentication.getName());

        String accessToken = authorizedClient.getAccessToken().getTokenValue();
        log.info("Access token: {}", accessToken);

        OidcUser user = (OidcUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.info("Id token: {}", user.getIdToken().getTokenValue());

        Map<String, String> usersMap = new HashMap<>();
        usersMap.put("access_token", accessToken);
        usersMap.put("refresh_token", authorizedClient.getRefreshToken() != null ? authorizedClient.getRefreshToken().getTokenValue() : null);
        usersMap.put("id_token", user.getIdToken().getTokenValue());
        usersMap.put("token_type", authorizedClient.getAccessToken().getTokenType().getValue());
        usersMap.put("token_expiry", authorizedClient.getAccessToken().getExpiresAt() != null ? String.valueOf(authorizedClient.getAccessToken().getExpiresAt()) : null);
        return usersMap;
    }
}