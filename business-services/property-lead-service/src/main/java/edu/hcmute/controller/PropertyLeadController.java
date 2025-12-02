package edu.hcmute.controller;

import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.service.PropertyLeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/property-lead")
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadController {
    private final PropertyLeadService propertyLeadService;

    @PostMapping
    @Operation(description = "Create a new property lead", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyLeadDto> createLead(@RequestBody PropertyLeadDto propertyLeadDto) {
        log.info("### create property lead ###");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyLeadService.createPropertyLead(propertyLeadDto));
    }

    @PutMapping("/{leadId}/details")
    @Operation(description = "Update property lead details", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyLeadDto> updateLead(@PathVariable Integer leadId, @RequestBody PropertyLeadDto propertyLeadDto) {
        log.info("### update property lead with id = {} ###", leadId);
        return ResponseEntity.ok(propertyLeadService.updatePropertyLead(leadId, propertyLeadDto));
    }

    @GetMapping
    @Operation(description = "Get all active property leads", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getAllActiveLeads() {
        return ResponseEntity.ok(propertyLeadService.findAllPropertyLeads());
    }

    @GetMapping("/all")
    @Operation(description = "Get all property leads", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getAllLeads(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(propertyLeadService.getAllLeads(sort, order));
    }

    @GetMapping("/stats")
    @Operation(description = "Get lead statistics", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<LeadStatsDto> getLeadStats() {
        return ResponseEntity.ok(propertyLeadService.getLeadStats());
    }

    @GetMapping("/{leadId}")
    @Operation(description = "Get property lead by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyLeadDto> getLeadById(@PathVariable Integer leadId) {
        return ResponseEntity.ok(propertyLeadService.getPropertyLeadById(leadId));
    }

    @GetMapping("/status/{status}")
    @Operation(description = "Get property leads by status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByStatus(status));
    }

    @GetMapping("/zipcode")
    @Operation(description = "Get property leads by zipcode", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getAllLeadsByZipCode(@RequestHeader String zipCode) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByZipcode(zipCode));
    }

    @GetMapping("/agent/{agentId}")
    @Operation(description = "Get property leads of an agent", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByAgent(@PathVariable String agentId) {
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsOfAgent(agentId));
    }

    @PutMapping("/{leadId}")
    @Operation(description = "Update property lead status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Object> updateLeadStatus(@PathVariable Integer leadId, @RequestHeader String leadStatus) {
        if (!StringUtils.hasText(leadStatus)) {
            return ResponseEntity.badRequest().body("Header lead-status must be present");
        }
        try {
            return ResponseEntity.ok(propertyLeadService.updateLeadStatus(leadId, leadStatus));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{leadId}")
    @Operation(description = "Delete property lead by Id", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deleteLeadById(@PathVariable Integer leadId) {
        propertyLeadService.deletePropertyLeadById(leadId);
        return ResponseEntity.noContent().build();
    }
}