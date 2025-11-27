package edu.hcmute.config;

import edu.hcmute.dto.AgentDto;
import edu.hcmute.dto.AgentLeadDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "property-agent-service", url = "${picma.services.property-agent-service.url}")
public interface PropertyAgentFeignClient {
    @GetMapping("/agent/{agentId}")
    AgentDto getAgentById(@PathVariable("agentId") String agentId);

    @PutMapping("/agent")
    void updateLeadAction(@RequestBody AgentLeadDto agentLeadDto);
}