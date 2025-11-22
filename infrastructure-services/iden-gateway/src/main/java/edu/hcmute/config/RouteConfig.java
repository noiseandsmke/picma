package edu.hcmute.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

import java.time.Duration;

@Configuration
@Slf4j
public class RouteConfig {
    @Bean
    public RouteLocator configureRoutes(RouteLocatorBuilder builder) {
        log.info("Configuring RouteLocator");
        return builder.routes()
                .route("userMgmt-getAllUsers-route", (route -> route
                        .path("/picma/users/**")
                        .filters(filter -> filter
                                .addRequestHeader("userType", "agent")
                                .rewritePath("/picma/users/?(?<segment>.*)", "/users/$\\{segment}")
                                .addResponseHeader("userType", "agent")
                                .localResponseCache(Duration.ofMinutes(3), DataSize.ofMegabytes(500)))
                        .uri("lb://USER-MGMT-SERVICE")))
//                .route("userMgmt-documents-route-01", (route -> route.path("/swagger-ui.html")
//                        .uri("lb://USER-MGMT-SERVICE")))
//                .route("userMgmt-documents-route-02", (route -> route.path("/swagger-ui/**")
//                        .uri("lb://USER-MGMT-SERVICE")))
//                .route("userMgmt-documents-route-03", (route -> route.path("/v3/**")
//                        .uri("lb://USER-MGMT-SERVICE")))
//                .route("userAuthNZ-token-route", (route -> route.path("/token")
//                        .uri("lb://USER-AUTHNZ-SERVICE")))
                .build();
    }
}