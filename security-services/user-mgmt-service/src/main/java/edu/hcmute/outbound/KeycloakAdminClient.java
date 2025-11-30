package edu.hcmute.outbound;

import edu.hcmute.config.KeycloakClientConfig;
import edu.hcmute.entity.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "keycloak-admin-client", url = "${picma.iam.usersApi}", configuration = KeycloakClientConfig.class)
public interface KeycloakAdminClient {

    @GetMapping
    List<User> getUsers(@RequestParam String search);

    @GetMapping("/{id}")
    User getUserById(@PathVariable String id);

    @PostMapping
    ResponseEntity<Void> createUser(@RequestBody User user);

    @PutMapping("/{id}")
    ResponseEntity<Void> updateUser(@PathVariable String id, @RequestBody User user);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteUser(@PathVariable String id);

    @GetMapping("/{userId}/groups")
    List<Map<String, Object>> getUserGroups(@PathVariable String userId);

    @PutMapping("/{userId}/groups/{groupId}")
    ResponseEntity<Void> joinGroup(@PathVariable String userId, @PathVariable String groupId);

    @DeleteMapping("/{userId}/groups/{groupId}")
    ResponseEntity<Void> leaveGroup(@PathVariable String userId, @PathVariable String groupId);
}