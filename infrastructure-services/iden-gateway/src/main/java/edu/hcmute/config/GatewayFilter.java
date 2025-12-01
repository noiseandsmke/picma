package edu.hcmute.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Base64;

@Component
@Slf4j
public class GatewayFilter implements GlobalFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("### PICMA gateway filter -> pre-processing request ###");
        ServerHttpRequest request = exchange.getRequest();
        log.info("====> Request header is added <====");
        log.info("Path = {}", request.getPath());
        log.info("URI = {}", request.getURI());
        log.info("Address = {}", request.getRemoteAddress());
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            HttpHeaders headers = exchange.getResponse().getHeaders();
            headers.add("picmaUri", request.getURI().toString());
            String encodedJSessionId = null;
            HttpCookie requestCookie = request.getCookies().getFirst("JSESSIONID");
            if (requestCookie != null) {
                log.info("{} = {}", requestCookie.getName(), requestCookie.getValue());
                encodedJSessionId = Base64.getEncoder().encodeToString(requestCookie.getValue().getBytes());
            }
            MultiValueMap<String, ResponseCookie> responseCookie = exchange.getResponse().getCookies();
            if (responseCookie.containsKey("JSESSIONID")) {
                log.info("Removing JSESSIONID...");
                responseCookie.remove("JSESSIONID", responseCookie.get("JSESSIONID"));
            }
            if (encodedJSessionId != null) {
                responseCookie.addIfAbsent("PicmaIgCookie", ResponseCookie.fromClientResponse("JSESSIONID", encodedJSessionId).build());
            }
        }));
    }
}