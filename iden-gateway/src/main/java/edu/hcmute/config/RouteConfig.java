package edu.hcmute.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class RouteConfig {
//    @Bean
//    public RouteLocator configureRoutes(RouteLocatorBuilder builder) {
//        log.info("Configuring RouteLocator");
//        return builder.routes()
//                .route("userMgmt-getAllUsers-route", (route -> route.path("/users/**")
//                        .uri("lb://USER-MGMT-SERVICE")))
//                .route("userMgmt-documents-route-01", (route -> route.path("/swagger-ui.html")
//                        .uri("lb://USER-MGMT-SERVICE")))
//                .route("userMgmt-documents-route-02", (route -> route.path("/swagger-ui/**")
//                        .uri("lb://USER-MGMT-SERVICE")))
//                .route("userMgmt-documents-route-03", (route -> route.path("/v3/**")
//                        .uri("lb://USER-MGMT-SERVICE")))
//                .route("userAuthNZ-token-route", (route -> route.path("/token")
//                        .uri("lb://USER-AUTHNZ-SERVICE")))
//                .build();
//    }
}