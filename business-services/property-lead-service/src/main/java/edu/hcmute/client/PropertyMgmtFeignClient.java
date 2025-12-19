package edu.hcmute.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "PROPERTY-MGMT-SERVICE", path = "/property-info")
public interface PropertyMgmtFeignClient {
    @DeleteMapping("/{propertyId}")
    void deletePropertyById(@PathVariable("propertyId") String propertyId);
}