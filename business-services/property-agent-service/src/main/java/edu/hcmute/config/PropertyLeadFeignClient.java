package edu.hcmute.config;

import edu.hcmute.dto.PropertyLeadDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(value = "property-lead-service", url = "${picma.services.property-lead-service.url}")
public interface PropertyLeadFeignClient {
    @PutMapping("/property-lead/{leadId}")
    String updateLeadStatusById(@PathVariable Integer leadId, @RequestHeader String leadStatus);

    @GetMapping("/property-lead/{leadId}")
    PropertyLeadDto getLeadById(@PathVariable Integer leadId);
}