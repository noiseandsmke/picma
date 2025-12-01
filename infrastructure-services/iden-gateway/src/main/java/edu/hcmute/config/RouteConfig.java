package edu.hcmute.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.unit.DataSize;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Configuration
@Slf4j
public class RouteConfig {
    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.just(exchange.getRequest().getRemoteAddress().getAddress().getHostAddress());
    }

    @Bean
    public RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(10, 20);
    }

    @Bean
    public RouteLocator configureRoutes(RouteLocatorBuilder builder) {
        log.info("Configuring RouteLocator with Resilience and Rate Limiting");
        return builder.routes()
                .route("userMgmt-getAllUsers-route", route -> route
                        .path("/picma/users/**")
                        .filters(filter -> filter
                                .addRequestHeader("userType", "agent")
                                .rewritePath("/picma/users/?(?<segment>.*)", "/users/${segment}")
                                .addResponseHeader("userType", "agent")
                                .localResponseCache(Duration.ofMinutes(3), DataSize.ofMegabytes(500))
                                .requestRateLimiter(r -> r.setRateLimiter(redisRateLimiter())
                                        .setKeyResolver(userKeyResolver()))
                                .circuitBreaker(config -> config.setName("userMgmtCircuitBreaker")
                                        .setFallbackUri("forward:/fallback"))
                        )
                        .uri("lb://USER-MGMT-SERVICE"))
                .route("userAuthNZ-token-route", route -> route
                        .path("/login/**")
                        .filters(filter -> filter
                                .rewritePath("/login/?(?<segment>.*)", "/token/${segment}")
                                .circuitBreaker(config -> config.setName("authCircuitBreaker")
                                        .setFallbackUri("forward:/fallback"))
                                .retry(retryConfig -> retryConfig.setRetries(3)
                                        .setSeries(org.springframework.http.HttpStatus.Series.SERVER_ERROR))
                        )
                        .uri("lb://USER-AUTHNZ-SERVICE"))
                .route("userMgmt-swagger-ui", route -> route.path("/swagger-ui.html")
                        .uri("lb://USER-MGMT-SERVICE"))
                .route("userMgmt-swagger-resources", route -> route.path("/swagger-ui/**")
                        .uri("lb://USER-MGMT-SERVICE"))
                .route("userMgmt-api-docs", route -> route.path("/v3/**")
                        .uri("lb://USER-MGMT-SERVICE"))
                .build();
    }
}