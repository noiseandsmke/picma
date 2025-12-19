package edu.hcmute.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.Map;

@Component
@Slf4j
public class AuthorizationFilter implements GlobalFilter, Ordered {
    private static final Map<String, String> PATH_ROLE_MAP = Map.of(
            "/picma/admin/", "ADMIN",
            "/picma/agent/", "AGENT",
            "/picma/owner/", "OWNER"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .flatMap(auth -> {
                    ServerWebExchange mutatedExchange = exchange;
                    if (auth instanceof JwtAuthenticationToken jwtToken) {
                        Jwt jwt = jwtToken.getToken();
                        ServerHttpRequest request = exchange.getRequest().mutate()
                                .header("X-User-Id", jwt.getSubject())
                                .header("X-User-Name", jwt.getClaimAsString("name"))
                                .header("X-User-Email", jwt.getClaimAsString("email"))
                                .header("X-User-Zipcode", jwt.getClaimAsString("zipcode"))
                                .header("X-User-Role", determineRole(auth.getAuthorities()))
                                .build();
                        mutatedExchange = exchange.mutate().request(request).build();
                    }

                    for (Map.Entry<String, String> entry : PATH_ROLE_MAP.entrySet()) {
                        if (path.startsWith(entry.getKey())) {
                            String requiredRole = entry.getValue();
                            if (!hasRole(auth.getAuthorities(), requiredRole)) {
                                mutatedExchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                                return mutatedExchange.getResponse().setComplete();
                            }
                        }
                    }
                    return chain.filter(mutatedExchange);
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    private boolean hasRole(Collection<? extends GrantedAuthority> authorities, String roleSuffix) {
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.endsWith(roleSuffix) || a.equalsIgnoreCase(roleSuffix));
    }

    private String determineRole(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.contains("default-roles"))
                .findFirst()
                .orElse("USER");
    }

    @Override
    public int getOrder() {
        return 2;
    }
}