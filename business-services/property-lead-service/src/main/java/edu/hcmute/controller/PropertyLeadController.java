package edu.hcmute.controller;

import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.service.PropertyLeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    @Operation(description = "create or update property lead", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyLeadDto> createLead(@RequestBody PropertyLeadDto propertyLeadDto) {
        log.info("### create or update property lead ###");
        log.info("PropertyLeadDto: {}", propertyLeadDto);
        return ResponseEntity.ok(propertyLeadService.createOrUpdatePropertyLead(propertyLeadDto));
    }

    @GetMapping
    @Operation(description = "get all active property leads", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getAllActiveLeads() {
        log.info("### get all active property leads ###");
        return ResponseEntity.ok(propertyLeadService.findAllPropertyLeads());
    }

    @GetMapping("/all")
    @Operation(description = "get all property leads (inclusive)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getAllLeads(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order
    ) {
        log.info("### get all property leads ###");
        return ResponseEntity.ok(propertyLeadService.getAllLeads(sort, order));
    }

    @GetMapping("/stats")
    @Operation(description = "get lead statistics", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<LeadStatsDto> getLeadStats() {
        log.info("### get lead stats ###");
        return ResponseEntity.ok(propertyLeadService.getLeadStats());
    }

    @GetMapping("/{leadId}")
    @Operation(description = "get property lead by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyLeadDto> getLeadById(@PathVariable Integer leadId) {
        log.info("### Get Lead by Id = {} ###", leadId);
        return ResponseEntity.ok(propertyLeadService.getPropertyLeadById(leadId));
    }

    @GetMapping("/status/{status}")
    @Operation(description = "get property leads by status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByStatus(@PathVariable String status) {
        log.info("### get property leads by status = {} ###", status);
        return ResponseEntity.ok(propertyLeadService.findPropertyLeadsByStatus(status));
    }

    @GetMapping("/zipcode")
    @Operation(description = "get all property leads by zipcode", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getAllLeadsByZipCode(@RequestHeader String zipCode) {
        log.info("### get all property leads by zipcode = {} ###", zipCode);
        List<PropertyLeadDto> leadList = propertyLeadService.findPropertyLeadsByZipcode(zipCode);
        return ResponseEntity.ok(leadList);
    }

    @GetMapping("/agent/{agentId}")
    @Operation(description = "get all property leads of an agent", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> getLeadsByAgent(@PathVariable String agentId) {
        log.info("### get all property leads of an agent = {} ###", agentId);
        List<PropertyLeadDto> leadList = propertyLeadService.findPropertyLeadsOfAgent(agentId);
        return ResponseEntity.ok(leadList);
    }

    @PutMapping("/{leadId}")
    @Operation(description = "update property lead status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Object> updateLeadStatus(
            @PathVariable Integer leadId,
            @RequestHeader String leadStatus) {
        log.info("### update property lead Id = {} to status {} ###", leadId, leadStatus);
        if (!StringUtils.hasText(leadStatus)) {
            return ResponseEntity.badRequest().body("Header lead-status must be present");
        }
        try {
            PropertyLeadDto result = propertyLeadService.updateLeadStatus(leadId, leadStatus);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error updating lead status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{leadId}")
    @Operation(description = "delete property lead by Id", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyLeadDto>> deleteLeadById(@PathVariable Integer leadId) {
        log.info("### delete property lead by Id = {} ###", leadId);
        List<PropertyLeadDto> remainingLeads = propertyLeadService.deletePropertyLeadById(leadId);
        return ResponseEntity.ok(remainingLeads);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("Illegal argument exception: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException ex) {
        log.error("Illegal state exception: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}