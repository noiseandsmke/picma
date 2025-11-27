package edu.hcmute.config;

import edu.hcmute.dto.AgentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "property-agent-service", url = "${picma.services.property-agent-service.url}")
public interface PropertyAgentFeignClient {
    @GetMapping("/agent/leads")
    String getAgentLeadsByAgentId(@RequestParam String agentId);

    @GetMapping("/agent/{agentId}")
    AgentDto getAgentById(@PathVariable("agentId") String agentId);
}