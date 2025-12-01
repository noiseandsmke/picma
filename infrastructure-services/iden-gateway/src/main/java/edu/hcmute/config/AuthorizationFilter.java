package edu.hcmute.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
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
                    for (Map.Entry<String, String> entry : PATH_ROLE_MAP.entrySet()) {
                        if (path.startsWith(entry.getKey())) {
                            String requiredRole = entry.getValue();
                            if (!hasRole(auth.getAuthorities(), requiredRole)) {
                                log.warn("Access Denied for user: {}. Path: {} requires Role: {}",
                                        auth.getName(), path, requiredRole);
                                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                                return exchange.getResponse().setComplete();
                            }
                        }
                    }
                    return chain.filter(exchange);
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    private boolean hasRole(Collection<? extends GrantedAuthority> authorities, String roleSuffix) {
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.endsWith(roleSuffix) || a.equalsIgnoreCase(roleSuffix));
    }

    @Override
    public int getOrder() {
        return 2;
    }
}