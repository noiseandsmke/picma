package edu.hcmute.client;

import edu.hcmute.dto.PropertyLeadDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "property-lead-service", url = "${application.config.property-lead-url:http://localhost:7103}")
public interface PropertyLeadClient {
    @GetMapping("/property-lead/{leadId}")
    PropertyLeadDto getLeadById(@PathVariable Integer leadId);
}