package edu.hcmute.config;

import edu.hcmute.dto.LeadInfoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "property-lead-service", url = "${picma.properties.lead.base-uri}")
public interface PropertyLeadFeignClient {
    @GetMapping("/property-lead/{leadId}")
    LeadInfoDto getLeadById(@PathVariable Integer leadId);
}
