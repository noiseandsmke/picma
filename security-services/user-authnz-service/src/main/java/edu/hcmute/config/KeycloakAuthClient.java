package edu.hcmute.config;

import edu.hcmute.dto.TokenResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "keycloak-client", url = "${keycloak.auth-server-url}", configuration = KeycloakClientConfig.class)
public interface KeycloakAuthClient {
    @PostMapping(value = "/realms/{realm}/protocol/openid-connect/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenResponse getToken(
            @PathVariable String realm,
            @RequestBody MultiValueMap<String, ?> params
    );

    @PostMapping(value = "/realms/{realm}/protocol/openid-connect/logout", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    void logout(
            @PathVariable String realm,
            @RequestBody MultiValueMap<String, ?> params
    );

    @PostMapping(value = "/admin/realms/{realm}/users", consumes = MediaType.APPLICATION_JSON_VALUE)
    void createUser(
            @PathVariable String realm,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> userRepresentation
    );
}