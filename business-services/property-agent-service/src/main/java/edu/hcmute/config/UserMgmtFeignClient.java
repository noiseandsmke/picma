package edu.hcmute.config;

import edu.hcmute.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-mgmt-service", url = "${picma.services.user-mgmt-service.url}")
public interface UserMgmtFeignClient {
    @GetMapping("/users/{userId}")
    UserDto getUserById(@PathVariable String userId);
}