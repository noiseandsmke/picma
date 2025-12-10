package edu.hcmute.config;

import edu.hcmute.dto.PropertyMgmtDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(value = "property-mgmt-service", url = "${picma.services.property-mgmt-service.url}")
public interface PropertyMgmtFeignClient {
    @GetMapping("/propertyInfo/{propertyId}")
    PropertyMgmtDto getPropertyInfoById(@PathVariable String propertyId);

    @GetMapping("/propertyInfo/zipcode/{zipCode}")
    List<PropertyMgmtDto> fetchAllPropertiesByZipCode(@PathVariable String zipCode);
}