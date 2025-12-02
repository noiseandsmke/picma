package edu.hcmute.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Slf4j
@RequiredArgsConstructor
public class SessionAuthenticationWebFilter implements WebFilter, Ordered {
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @NonNull
    @Override
    public Mono<Void> filter(@NonNull ServerWebExchange exchange, @NonNull WebFilterChain chain) {
        HttpCookie sessionCookie = exchange.getRequest().getCookies().getFirst("PICMA_SESSION");
        if (sessionCookie == null) {
            return chain.filter(exchange);
        }
        String sessionId = sessionCookie.getValue();
        String key = "SESSION:" + sessionId;
        return redisTemplate.opsForValue().get(key)
                .flatMap(jsonString -> {
                    String accessToken = extractAccessToken(jsonString);
                    if (accessToken != null) {
                        ServerHttpRequest request = exchange.getRequest().mutate()
                                .header("Authorization", "Bearer " + accessToken)
                                .build();
                        return chain.filter(exchange.mutate().request(request).build());
                    }
                    return chain.filter(exchange);
                })
                .switchIfEmpty(Mono.defer(() -> chain.filter(exchange)));
    }

    private String extractAccessToken(String jsonString) {
        try {
            JsonNode node = objectMapper.readTree(jsonString);
            if (node.has("access_token")) {
                return node.get("access_token").asText();
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to parse token response from Redis", e);
        }
        return null;
    }

    @Override
    public int getOrder() {
        return -200;
    }
}