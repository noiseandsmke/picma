package edu.hcmute.controller;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.service.PropertyInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/property-info")
@RequiredArgsConstructor
@Tag(name = "Property Management", description = "API for managing property information (MongoDB)")
public class PropertyManagementController {
    private final PropertyInfoService propertyInfoService;

    @PostMapping
    @Operation(summary = "Save property info", description = "Save new property information")
    public ResponseEntity<PropertyInfoDto> savePropertyInfo(@RequestBody PropertyInfoDto propertyInfoDto) {
        PropertyInfoDto result = propertyInfoService.createPropertyInfo(propertyInfoDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    @Operation(summary = "Get all properties", description = "Get all property information with sorting")
    public ResponseEntity<List<PropertyInfoDto>> getAllPropertiesInfo(
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        return ResponseEntity.ok(propertyInfoService.getAllProperties(sortBy, sortDirection));
    }

    @GetMapping("/{propertyId}")
    @Operation(summary = "Get property by ID", description = "Get property information by ID")
    public ResponseEntity<PropertyInfoDto> getPropertyById(
            @Parameter(description = "ID of the property info", required = true)
            @PathVariable String propertyId
    ) {
        return ResponseEntity.ok(propertyInfoService.getPropertyInfoById(propertyId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get properties by user", description = "Get property information for a user")
    public ResponseEntity<List<PropertyInfoDto>> getPropertiesByUserId(
            @Parameter(description = "ID of the user", required = true)
            @PathVariable String userId
    ) {
        return ResponseEntity.ok(propertyInfoService.getPropertiesByUserId(userId));
    }

    @PutMapping("/{propertyId}")
    @Operation(summary = "Update property info", description = "Update property information")
    public ResponseEntity<PropertyInfoDto> updateProperty(
            @Parameter(description = "ID of the property info", required = true)
            @PathVariable String propertyId,
            @RequestBody PropertyInfoDto propertyInfoDto
    ) {
        return ResponseEntity.ok(propertyInfoService.updatePropertyInfo(propertyId, propertyInfoDto));
    }

    @DeleteMapping("/{propertyId}")
    @Operation(summary = "Delete property info", description = "Delete property information by ID")
    public ResponseEntity<Void> deletePropertyById(
            @Parameter(description = "ID of the property info", required = true)
            @PathVariable String propertyId
    ) {
        propertyInfoService.deletePropertyById(propertyId);
        return ResponseEntity.noContent().build();
    }
}