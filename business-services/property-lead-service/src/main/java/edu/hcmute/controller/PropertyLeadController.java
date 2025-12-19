package edu.hcmute.controller;

import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.LeadTrendDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.service.PropertyLeadService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/property-lead")
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadController {
    private final PropertyLeadService propertyLeadService;

    @PostMapping
    @Operation(description = "Create a new property lead")
    public ResponseEntity<PropertyLeadDto> createLead(@RequestBody PropertyLeadDto propertyLeadDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyLeadService.createPropertyLead(propertyLeadDto));
    }

    @PutMapping("/{leadId}")
    @Operation(description = "Update property lead details")
    public ResponseEntity<PropertyLeadDto> updateLead(@PathVariable Integer leadId, @RequestBody PropertyLeadDto propertyLeadDto) {
        return ResponseEntity.ok(propertyLeadService.updatePropertyLead(leadId, propertyLeadDto));
    }

    @GetMapping
    @Operation(description = "Get all property leads")
    public ResponseEntity<List<PropertyLeadDto>> getAllLeads(
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(propertyLeadService.getAllPropertyLeads(sortBy, sortDirection, status));
    }

    @GetMapping("/stats")
    @Operation(description = "Get lead statistics")
    public ResponseEntity<LeadStatsDto> getLeadStats() {
        return ResponseEntity.ok(propertyLeadService.getLeadStats());
    }

    @GetMapping("/stats/trend")
    @Operation(description = "Get lead trend data")
    public ResponseEntity<List<LeadTrendDto>> getLeadTrend() {
        return ResponseEntity.ok(propertyLeadService.getLeadTrend());
    }

    @GetMapping("/{leadId}")
    @Operation(description = "Get property lead by ID")
    public ResponseEntity<PropertyLeadDto> getLeadById(@PathVariable Integer leadId) {
        return ResponseEntity.ok(propertyLeadService.getPropertyLeadById(leadId));
    }

    @GetMapping("/status/{status}")
    @Operation(description = "Get property leads by status")
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByStatus(status));
    }

    @GetMapping("/zipcode/{zipCode}")
    @Operation(description = "Get property leads by zipcode")
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByZipCode(@PathVariable String zipCode) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByZipCode(zipCode));
    }

    @GetMapping("/user/{userId}")
    @Operation(description = "Get property leads of a user")
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByUser(userId));
    }

    @PutMapping("/{leadId}/status/{status}")
    @Operation(description = "Update property lead status")
    public ResponseEntity<Object> updateLeadStatus(@PathVariable Integer leadId, @PathVariable String status) {
        try {
            return ResponseEntity.ok(propertyLeadService.updatePropertyLeadStatus(leadId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{leadId}")
    @Operation(description = "Delete property lead by Id")
    public ResponseEntity<Void> deleteLeadById(@PathVariable Integer leadId) {
        propertyLeadService.deletePropertyLeadById(leadId);
        return ResponseEntity.noContent().build();
    }
}