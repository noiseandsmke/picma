package edu.hcmute.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "keycloak-auth-client", url = "${keycloak.auth-server-url}/realms/${keycloak.realm}/protocol/openid-connect")
public interface KeycloakAuthClient {
    @PostMapping(value = "/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    Map<String, Object> getToken(@RequestBody Map<String, ?> formParams);
}