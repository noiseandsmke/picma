package edu.hcmute.config;

import edu.hcmute.dto.PropertyInfoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "property-mgmt-service", url = "${picma.services.property-mgmt-service.url}")
public interface PropertyMgmtFeignClient {
    @GetMapping("/propertyInfo/{propertyId}")
    PropertyInfoDto getPropertyById(@PathVariable String propertyId);

    @GetMapping("/propertyInfo/zipcode/{zipcode}")
    List<PropertyInfoDto> fetchAllPropertiesByZipCode(@PathVariable String zipcode);
}