package edu.hcmute.outbound;

import edu.hcmute.config.KeycloakClientConfig;
import edu.hcmute.entity.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "keycloak-group-client", url = "${picma.iam.groupsApi}", configuration = KeycloakClientConfig.class)
public interface KeycloakGroupClient {

    @GetMapping("/{groupId}/members")
    List<User> getGroupMembers(@PathVariable("groupId") String groupId);
}