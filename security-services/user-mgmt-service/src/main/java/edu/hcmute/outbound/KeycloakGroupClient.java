package edu.hcmute.outbound;

import edu.hcmute.entity.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "keycloak-group-client", url = "${picma.iam.groupsApi}")
public interface KeycloakGroupClient {

    @GetMapping("/{groupId}/members")
    List<User> getGroupMembers(@PathVariable String groupId);
}