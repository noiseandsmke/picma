package edu.hcmute.client;

import edu.hcmute.config.KeycloakClientConfig;
import edu.hcmute.dto.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "keycloak-admin-client", url = "${picma.iam.usersApi}", configuration = KeycloakClientConfig.class)
public interface KeycloakAdminClient {
    @GetMapping
    List<User> getUsers(@RequestParam String search);

    @GetMapping("/{id}")
    User getUserById(@PathVariable String id);

    @PutMapping("/{id}")
    ResponseEntity<Void> updateUser(@PathVariable String id, @RequestBody User user);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteUser(@PathVariable String id);

    @DeleteMapping("/{userId}/groups/{groupId}")
    ResponseEntity<Void> leaveGroup(@PathVariable String userId, @PathVariable String groupId);
}