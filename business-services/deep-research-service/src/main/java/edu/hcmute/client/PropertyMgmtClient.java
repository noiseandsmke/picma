package edu.hcmute.client;

import edu.hcmute.dto.PropertyInfoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "property-mgmt-service", url = "${application.config.property-mgmt-url:http://localhost:7101}")
public interface PropertyMgmtClient {
    @GetMapping("/propertyInfo/{id}")
    PropertyInfoDto getProperty(@PathVariable String id);
}