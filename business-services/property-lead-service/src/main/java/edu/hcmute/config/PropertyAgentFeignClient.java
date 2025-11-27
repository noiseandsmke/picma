package edu.hcmute.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "property-agent-service", url = "${picma.services.property-agent-service.url}")
public interface PropertyAgentFeignClient {
    @GetMapping("/agent/leads")
    String getAgentLeadsByAgentId(@RequestParam String agentId);
}