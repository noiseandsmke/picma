package edu.hcmute.client;

import edu.hcmute.config.KeycloakServiceAccountConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "keycloak-admin-client", url = "${picma.iam.usersApi}", configuration = KeycloakServiceAccountConfig.class)
public interface KeycloakAdminClient {
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Void> createUser(@RequestBody Map<String, Object> userRepresentation);

    @PutMapping(value = "/{id}/groups/{groupId}")
    void joinGroup(
            @PathVariable String id,
            @PathVariable String groupId
    );
}