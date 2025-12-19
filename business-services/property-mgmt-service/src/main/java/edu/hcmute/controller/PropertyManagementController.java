package edu.hcmute.controller;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.service.PropertyInfoService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/property-info")
@RequiredArgsConstructor
public class PropertyManagementController {
    private final PropertyInfoService propertyInfoService;

    @PostMapping
    public ResponseEntity<PropertyInfoDto> savePropertyInfo(@RequestBody PropertyInfoDto propertyInfoDto) {
        PropertyInfoDto result = propertyInfoService.createPropertyInfo(propertyInfoDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<List<PropertyInfoDto>> getAllPropertiesInfo(
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        return ResponseEntity.ok(propertyInfoService.getAllProperties(sortBy, sortDirection));
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyInfoDto> getPropertyById(@PathVariable String propertyId) {
        return ResponseEntity.ok(propertyInfoService.getPropertyInfoById(propertyId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PropertyInfoDto>> getPropertiesByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(propertyInfoService.getPropertiesByUserId(userId));
    }

    @PutMapping("/{propertyId}")
    public ResponseEntity<PropertyInfoDto> updateProperty(@PathVariable String propertyId, @RequestBody PropertyInfoDto propertyInfoDto) {
        return ResponseEntity.ok(propertyInfoService.updatePropertyInfo(propertyId, propertyInfoDto));
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> deletePropertyById(@PathVariable String propertyId) {
        propertyInfoService.deletePropertyById(propertyId);
        return ResponseEntity.noContent().build();
    }
}