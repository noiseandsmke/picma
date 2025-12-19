package edu.hcmute.controller;

import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.LeadTrendDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.service.PropertyLeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Property Lead", description = "API for managing property leads")
public class PropertyLeadController {
    private final PropertyLeadService propertyLeadService;

    @PostMapping
    @Operation(summary = "Create property lead", description = "Create a new property lead")
    public ResponseEntity<PropertyLeadDto> createLead(@RequestBody PropertyLeadDto propertyLeadDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyLeadService.createPropertyLead(propertyLeadDto));
    }

    @PutMapping("/{leadId}")
    @Operation(summary = "Update property lead", description = "Update property lead details")
    public ResponseEntity<PropertyLeadDto> updateLead(
            @Parameter(description = "ID of the property lead", required = true)
            @PathVariable Integer leadId,
            @RequestBody PropertyLeadDto propertyLeadDto
    ) {
        return ResponseEntity.ok(propertyLeadService.updatePropertyLead(leadId, propertyLeadDto));
    }

    @GetMapping
    @Operation(summary = "Get all leads", description = "Get all property leads with sorting and filtering")
    public ResponseEntity<List<PropertyLeadDto>> getAllLeads(
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(propertyLeadService.getAllPropertyLeads(sortBy, sortDirection, status));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get lead stats", description = "Get lead statistics")
    public ResponseEntity<LeadStatsDto> getLeadStats() {
        return ResponseEntity.ok(propertyLeadService.getLeadStats());
    }

    @GetMapping("/stats/trend")
    @Operation(summary = "Get lead trend", description = "Get lead trend data")
    public ResponseEntity<List<LeadTrendDto>> getLeadTrend() {
        return ResponseEntity.ok(propertyLeadService.getLeadTrend());
    }

    @GetMapping("/{leadId}")
    @Operation(summary = "Get lead by ID", description = "Get property lead by ID")
    public ResponseEntity<PropertyLeadDto> getLeadById(
            @Parameter(description = "ID of the property lead", required = true)
            @PathVariable Integer leadId
    ) {
        return ResponseEntity.ok(propertyLeadService.getPropertyLeadById(leadId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get leads by status", description = "Get property leads by status")
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByStatus(
            @Parameter(description = "Status of the leads", required = true)
            @PathVariable String status
    ) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByStatus(status));
    }

    @GetMapping("/zipcode/{zipCode}")
    @Operation(summary = "Get leads by zipcode", description = "Get property leads by zipcode")
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByZipCode(
            @Parameter(description = "Zipcode to filter leads", required = true)
            @PathVariable String zipCode
    ) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByZipCode(zipCode));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get leads by user", description = "Get property leads of a user")
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByUser(
            @Parameter(description = "ID of the user", required = true)
            @PathVariable String userId
    ) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByUser(userId));
    }

    @PutMapping("/{leadId}/status/{status}")
    @Operation(summary = "Update lead status", description = "Update property lead status")
    public ResponseEntity<Object> updateLeadStatus(
            @Parameter(description = "ID of the property lead", required = true)
            @PathVariable Integer leadId,
            @Parameter(description = "New status for the lead", required = true)
            @PathVariable String status
    ) {
        try {
            return ResponseEntity.ok(propertyLeadService.updatePropertyLeadStatus(leadId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{leadId}")
    @Operation(summary = "Delete lead", description = "Delete property lead by Id")
    public ResponseEntity<Void> deleteLeadById(
            @Parameter(description = "ID of the property lead", required = true)
            @PathVariable Integer leadId
    ) {
        propertyLeadService.deletePropertyLeadById(leadId);
        return ResponseEntity.noContent().build();
    }
}