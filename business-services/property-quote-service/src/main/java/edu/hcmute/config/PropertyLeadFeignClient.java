package edu.hcmute.config;

import edu.hcmute.dto.LeadInfoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "property-lead-service", url = "${picma.services.property-lead-service.url}")
public interface PropertyLeadFeignClient {
    @GetMapping("/property-lead/{leadId}")
    LeadInfoDto getLeadById(@PathVariable Integer leadId);

    @PutMapping("/property-lead/{leadId}")
    String updateLeadStatusById(@PathVariable Integer leadId, @RequestHeader String status);
}