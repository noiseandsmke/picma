package edu.hcmute.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TokenProcessControllerTest {

    @Mock
    private OAuth2AuthorizedClientService authorizedClientService;
    @Mock
    private RedisTemplate<String, String> cacheServer;
    @Mock
    private HttpServletResponse response;
    @Mock
    private HttpServletRequest request;
    @Mock
    private HashOperations<String, Object, Object> hashOperations;
    @Mock
    private OAuth2AuthorizedClient authorizedClient;
    @Mock
    private OAuth2AccessToken accessToken;
    @Mock
    private OAuth2RefreshToken refreshToken;
    @Mock
    private OidcUser oidcUser;
    @Mock
    private OidcIdToken idToken;

    private TokenProcessController tokenProcessController;

    @BeforeEach
    void setUp() {
        tokenProcessController = new TokenProcessController(authorizedClientService, cacheServer, response, request);
    }

    @Test
    void generateToken_success() {
        OAuth2AuthenticationToken authentication = mock(OAuth2AuthenticationToken.class);
        when(authentication.getName()).thenReturn("user1");
        when(authentication.getAuthorizedClientRegistrationId()).thenReturn("regId");

        when(authorizedClientService.loadAuthorizedClient("regId", "user1")).thenReturn(authorizedClient);
        when(authorizedClient.getAccessToken()).thenReturn(accessToken);
        when(authorizedClient.getRefreshToken()).thenReturn(refreshToken);

        when(accessToken.getTokenValue()).thenReturn("access-token-123");
        when(accessToken.getTokenType()).thenReturn(OAuth2AccessToken.TokenType.BEARER);
        when(accessToken.getExpiresAt()).thenReturn(Instant.now().plusSeconds(3600));

        when(refreshToken.getTokenValue()).thenReturn("refresh-token-123");

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getIdToken()).thenReturn(idToken);
        when(idToken.getTokenValue()).thenReturn("id-token-123");

        when(cacheServer.opsForHash()).thenReturn(hashOperations);

        when(request.getHeader("policyType")).thenReturn("policy");
        when(request.getServerName()).thenReturn("localhost");
        when(request.getContextPath()).thenReturn("/");

        Map<String, String> result = tokenProcessController.generateToken(authentication);

        assertNotNull(result);
        assertEquals("access-token-123", result.get("access_token"));
        assertEquals("refresh-token-123", result.get("refresh_token"));
        assertEquals("id-token-123", result.get("id_token"));
        assertEquals("Bearer", result.get("token_type"));

        verify(hashOperations, times(2)).put(anyString(), anyString(), anyString());
        verify(response).addCookie(any());
    }
}