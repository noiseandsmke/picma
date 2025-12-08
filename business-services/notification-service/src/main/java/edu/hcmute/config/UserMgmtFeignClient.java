package edu.hcmute.config;

import edu.hcmute.dto.AgentInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "user-mgmt-service", url = "${picma.services.user-mgmt-service.url}")
public interface UserMgmtFeignClient {
    @GetMapping("/users/agents/zipcode/{zipCode}")
    List<AgentInfo> getAgentsByZipCode(@PathVariable String zipCode);
}