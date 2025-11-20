package edu.hcmute.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(value = "property-lead-service", url = "${picma.properties.lead.base-uri}")
public interface PropertyLeadFeignClient {
    @PutMapping("/property-lead/{leadId}")
    String updateLeadActionById(@PathVariable Integer leadId, @RequestHeader String leadStatus);
}