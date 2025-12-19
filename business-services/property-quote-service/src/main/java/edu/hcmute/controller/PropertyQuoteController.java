package edu.hcmute.controller;

import edu.hcmute.dto.CreateQuoteDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.dto.QuoteTrendDto;
import edu.hcmute.dto.UpdateQuoteDto;
import edu.hcmute.service.PropertyQuoteService;
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
@RequestMapping("/property-quote")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Property Quote", description = "API for managing insurance quotes")
public class PropertyQuoteController {
    private final PropertyQuoteService propertyQuoteService;

    @PostMapping
    @Operation(summary = "Create property quote", description = "Create a property quote for an existing lead")
    public ResponseEntity<PropertyQuoteDto> createPropertyQuote(@RequestBody CreateQuoteDto createDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyQuoteService.createPropertyQuote(createDto));
    }

    @GetMapping
    @Operation(summary = "Get all quotes", description = "Get all property quotes")
    public ResponseEntity<List<PropertyQuoteDto>> getAllPropertyQuotes(
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String agentId
    ) {
        return ResponseEntity.ok(propertyQuoteService.getAllPropertyQuotes(sortBy, sortDirection, status, agentId));
    }

    @GetMapping("/trend")
    @Operation(summary = "Get quote trend", description = "Get quote trend for last 7 days")
    public ResponseEntity<List<QuoteTrendDto>> getQuoteTrend() {
        return ResponseEntity.ok(propertyQuoteService.getQuoteTrend());
    }

    @GetMapping("/{quoteId}")
    @Operation(summary = "Get quote by ID", description = "Get property quote by ID")
    public ResponseEntity<PropertyQuoteDto> getPropertyQuoteById(
            @Parameter(description = "ID of the property quote", required = true)
            @PathVariable Integer quoteId
    ) {
        return ResponseEntity.ok(propertyQuoteService.getPropertyQuoteById(quoteId));
    }

    @GetMapping("/lead/{leadId}")
    @Operation(summary = "Get quotes by lead", description = "Get all property quotes for a lead")
    public ResponseEntity<List<PropertyQuoteDto>> getQuotesByLeadId(
            @Parameter(description = "ID of the property lead", required = true)
            @PathVariable Integer leadId
    ) {
        return ResponseEntity.ok(propertyQuoteService.getQuotesByLeadId(leadId));
    }

    @GetMapping("/agent/{agentId}")
    @Operation(summary = "Get quotes by agent", description = "Get all property quotes for an agent")
    public ResponseEntity<List<PropertyQuoteDto>> getQuotesByAgentId(
            @Parameter(description = "ID of the agent", required = true)
            @PathVariable String agentId
    ) {
        return ResponseEntity.ok(propertyQuoteService.getQuotesByAgentId(agentId));
    }

    @PutMapping("/{quoteId}")
    @Operation(summary = "Update property quote", description = "Update property quote")
    public ResponseEntity<PropertyQuoteDto> updatePropertyQuote(
            @Parameter(description = "ID of the property quote", required = true)
            @PathVariable Integer quoteId,
            @RequestBody UpdateQuoteDto updateDto
    ) {
        return ResponseEntity.ok(propertyQuoteService.updatePropertyQuote(quoteId, updateDto));
    }

    @DeleteMapping("/{quoteId}")
    @Operation(summary = "Delete property quote", description = "Delete property quote by ID")
    public ResponseEntity<Void> deletePropertyQuoteById(
            @Parameter(description = "ID of the property quote", required = true)
            @PathVariable Integer quoteId
    ) {
        propertyQuoteService.deletePropertyQuoteById(quoteId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{quoteId}/accept")
    @Operation(summary = "Accept quote", description = "Accept a property quote")
    public ResponseEntity<Void> acceptQuote(
            @Parameter(description = "ID of the property quote", required = true)
            @PathVariable Integer quoteId
    ) {
        propertyQuoteService.acceptQuote(quoteId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{quoteId}/reject")
    @Operation(summary = "Reject quote", description = "Reject a property quote")
    public ResponseEntity<Void> rejectQuote(
            @Parameter(description = "ID of the property quote", required = true)
            @PathVariable Integer quoteId
    ) {
        propertyQuoteService.rejectQuote(quoteId);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}