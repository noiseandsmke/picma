package edu.hcmute.controller;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.service.PropertyInfoService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/propertyInfo")
@Slf4j
@AllArgsConstructor
public class PropertyManagementController {
    private PropertyInfoService propertyInfoService;

    @PostMapping
    public ResponseEntity<PropertyInfoDto> savePropertyInfo(@RequestBody PropertyInfoDto propertyInfoDto) {
        log.info("### Saving PropertyInfo ###");
        propertyInfoDto = propertyInfoService.createPropertyInfo(propertyInfoDto);
        return ResponseEntity.ok(propertyInfoDto);
    }

    @GetMapping
    public ResponseEntity<List<PropertyInfoDto>> getAllPropertiesInfo() {
        log.info("### Getting all PropertiesInfo ###");
        List<PropertyInfoDto> propertiesList = propertyInfoService.getAllProperties();
        return ResponseEntity.ok(propertiesList);
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyInfoDto> getPropertyById(@PathVariable String propertyId) {
        log.info("### Getting PropertyInfo by id ###");
        log.info(propertyId);
        return ResponseEntity.ok(propertyInfoService.getPropertyInfoById(propertyId));
    }

    @GetMapping("/zipcode/{zipcode}")
    public ResponseEntity<List<PropertyInfoDto>> getPropertyByZipCode(@PathVariable String zipcode) {
        log.info("### Getting PropertyInfo by ZipCode ###");
        List<PropertyInfoDto> propertiesList = propertyInfoService.getPropertiesByZipCode(zipcode);
        return ResponseEntity.ok(propertiesList);
    }
}