package edu.hcmute.client;

import edu.hcmute.dto.TokenResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "keycloak-client", url = "${keycloak.auth-server-url}/realms/${keycloak.realm}/protocol/openid-connect")
public interface KeycloakAuthClient {
    @PostMapping(value = "/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenResponse getToken(@RequestBody MultiValueMap<String, ?> params);

    @PostMapping(value = "/logout", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    void logout(@RequestBody MultiValueMap<String, ?> params);
}