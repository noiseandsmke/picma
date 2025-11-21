package edu.hcmute.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "property-agent-service", url = "${picma.properties.agent.base-uri}")
public interface PropertyAgentFeignClient {
    @GetMapping("/agents/zipcode")
    List<String> getAgentsByZipCode(@RequestHeader String zipCode);
}