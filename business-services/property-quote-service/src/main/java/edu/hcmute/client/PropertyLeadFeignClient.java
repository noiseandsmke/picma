package edu.hcmute.client;

import edu.hcmute.dto.PropertyLeadDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "PROPERTY-LEAD-SERVICE", path = "/property-lead")
public interface PropertyLeadFeignClient {
    @PutMapping("/{leadId}/status/{status}")
    void updateLeadStatus(@PathVariable Integer leadId, @PathVariable String status);

    @GetMapping("/{leadId}")
    PropertyLeadDto getLeadById(@PathVariable Integer leadId);
}