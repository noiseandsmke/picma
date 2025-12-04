package edu.hcmute.controller;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.service.PropertyInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/propertyInfo")
@Slf4j
@RequiredArgsConstructor
public class PropertyManagementController {

    private final PropertyInfoService propertyInfoService;

    @PostMapping
    public ResponseEntity<PropertyInfoDto> savePropertyInfo(@RequestBody PropertyInfoDto propertyInfoDto) {
        log.info("### Saving PropertyInfo ###");
        PropertyInfoDto result = propertyInfoService.createPropertyInfo(propertyInfoDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<List<PropertyInfoDto>> getAllPropertiesInfo(@RequestParam(required = false) String sort,
                                                                      @RequestParam(defaultValue = "asc") String direction) {
        log.info("### Getting all PropertiesInfo with sort: {}, direction: {} ###", sort, direction);
        return ResponseEntity.ok(propertyInfoService.getAllProperties(sort, direction));
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyInfoDto> getPropertyById(@PathVariable String propertyId) {
        log.info("### Getting PropertyInfo by id = {} ###", propertyId);
        return ResponseEntity.ok(propertyInfoService.getPropertyInfoById(propertyId));
    }

    @GetMapping("/zipcode/{zipcode}")
    public ResponseEntity<List<PropertyInfoDto>> getPropertyByZipCode(@PathVariable String zipcode) {
        log.info("### Getting PropertyInfo by ZipCode = {} ###", zipcode);
        return ResponseEntity.ok(propertyInfoService.getPropertiesByZipCode(zipcode));
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> deletePropertyById(@PathVariable String propertyId) {
        log.info("### Deleting PropertyInfo by id = {} ###", propertyId);
        propertyInfoService.deletePropertyById(propertyId);
        return ResponseEntity.noContent().build();
    }
}