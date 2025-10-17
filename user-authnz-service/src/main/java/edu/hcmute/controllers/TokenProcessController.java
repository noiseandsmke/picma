package edu.hcmute.controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
public class TokenProcessController {
    private OAuth2AuthorizedClientService authorizedClientService;
    private RedisTemplate<String, String> cacheServer;
    private HttpServletResponse response;
    private HttpServletRequest request;

    public TokenProcessController(OAuth2AuthorizedClientService authorizedClientService, RedisTemplate<String, String> cacheServer, HttpServletResponse response, HttpServletRequest request) {
        this.authorizedClientService = authorizedClientService;
        this.cacheServer = cacheServer;
        this.response = response;
        this.request = request;
    }

    @GetMapping({"/token", "/token/"})
    public Map<String, String> generateToken(OAuth2AuthenticationToken authentication) {
        log.info("Policy type: {}", request.getHeader("policyType"));
        String subId = authentication.getName();
        log.info("Logged in user: {}", authentication.getName());
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

        JSONObject jsonObject = new JSONObject(usersMap);
        log.info("JSON object of usersMap: {}", jsonObject);
        cacheServer.opsForHash().put(subId, subId, accessToken);
        cacheServer.opsForHash().put(accessToken, accessToken, subId);

        String hostname = request.getServerName();
        log.info("Hostname: {}", hostname);
        String contextPath = request.getContextPath();
        log.info("Context path: {}", contextPath);
        Cookie cookie = new Cookie("picma_cookie", Base64.getEncoder().encodeToString(jsonObject.toString().getBytes()));
        cookie.setPath(contextPath);
        cookie.setMaxAge(authorizedClient.getAccessToken().getExpiresAt().getNano());
        cookie.setDomain(hostname);
        response.addCookie(cookie);
        return usersMap;
    }
}