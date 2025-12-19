package edu.hcmute.client;

import edu.hcmute.dto.PropertyInfoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "PROPERTY-MGMT-SERVICE", path = "/property-info")
public interface PropertyInfoClient {
    @GetMapping("/{id}")
    PropertyInfoDto getPropertyInfoById(@PathVariable String id);
}