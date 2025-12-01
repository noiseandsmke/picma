package edu.hcmute.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
@Slf4j
@RequiredArgsConstructor
public class TokenValidationFilter implements GlobalFilter, Ordered {
    private final ReactiveStringRedisTemplate redisTemplate;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(auth -> auth.isAuthenticated() && auth.getPrincipal() instanceof Jwt)
                .flatMap(auth -> {
                    Jwt jwt = (Jwt) auth.getPrincipal();
                    String extractedTokenId = jwt.getId();
                    if (extractedTokenId == null) {
                        extractedTokenId = String.valueOf(jwt.getTokenValue().hashCode());
                    }
                    final String tokenId = extractedTokenId;
                    String cacheKey = "token_status:" + tokenId;
                    return redisTemplate.opsForValue().get(cacheKey)
                            .switchIfEmpty(Mono.defer(() -> {
                                log.info("Token Cache MISS for ID: {}. Caching status.", tokenId);
                                Duration ttl = Duration.ofMinutes(10);
                                if (jwt.getExpiresAt() != null) {
                                    long remaining = java.time.Duration.between(java.time.Instant.now(), jwt.getExpiresAt()).getSeconds();
                                    if (remaining > 0) ttl = Duration.ofSeconds(remaining);
                                }
                                return redisTemplate.opsForValue().set(cacheKey, "ACTIVE", ttl)
                                        .thenReturn("ACTIVE");
                            }))
                            .flatMap(status -> chain.filter(exchange));
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        return 0;
    }
}