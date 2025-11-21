package edu.hcmute.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "property-mgmt-service", url = "${picma.properties.management.base-uri}")
public interface PropertyInfoFeignClient {
    @GetMapping("/properties/{id}")
    String getPropertyInfoById(@PathVariable("id") String id);
}