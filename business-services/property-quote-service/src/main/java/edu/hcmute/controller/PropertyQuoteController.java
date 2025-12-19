package edu.hcmute.controller;

import edu.hcmute.dto.CreateQuoteDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.dto.QuoteTrendDto;
import edu.hcmute.dto.UpdateQuoteDto;
import edu.hcmute.service.PropertyQuoteService;
import io.swagger.v3.oas.annotations.Operation;
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
public class PropertyQuoteController {
    private final PropertyQuoteService propertyQuoteService;

    @PostMapping
    @Operation(description = "Create a property quote for an existing lead")
    public ResponseEntity<PropertyQuoteDto> createPropertyQuote(@RequestBody CreateQuoteDto createDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyQuoteService.createPropertyQuote(createDto));
    }

    @GetMapping
    @Operation(description = "Get all property quotes")
    public ResponseEntity<List<PropertyQuoteDto>> getAllPropertyQuotes(
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String agentId
    ) {
        return ResponseEntity.ok(propertyQuoteService.getAllPropertyQuotes(sortBy, sortDirection, status, agentId));
    }

    @GetMapping("/trend")
    @Operation(description = "Get quote trend for last 7 days")
    public ResponseEntity<List<QuoteTrendDto>> getQuoteTrend() {
        return ResponseEntity.ok(propertyQuoteService.getQuoteTrend());
    }

    @GetMapping("/{quoteId}")
    @Operation(description = "Get property quote by ID")
    public ResponseEntity<PropertyQuoteDto> getPropertyQuoteById(@PathVariable Integer quoteId) {
        return ResponseEntity.ok(propertyQuoteService.getPropertyQuoteById(quoteId));
    }

    @GetMapping("/lead/{leadId}")
    @Operation(description = "Get all property quotes for a lead")
    public ResponseEntity<List<PropertyQuoteDto>> getQuotesByLeadId(@PathVariable Integer leadId) {
        return ResponseEntity.ok(propertyQuoteService.getQuotesByLeadId(leadId));
    }

    @GetMapping("/agent/{agentId}")
    @Operation(description = "Get all property quotes for an agent")
    public ResponseEntity<List<PropertyQuoteDto>> getQuotesByAgentId(@PathVariable String agentId) {
        return ResponseEntity.ok(propertyQuoteService.getQuotesByAgentId(agentId));
    }

    @PutMapping("/{quoteId}")
    @Operation(description = "Update property quote")
    public ResponseEntity<PropertyQuoteDto> updatePropertyQuote(@PathVariable Integer quoteId, @RequestBody UpdateQuoteDto updateDto) {
        return ResponseEntity.ok(propertyQuoteService.updatePropertyQuote(quoteId, updateDto));
    }

    @DeleteMapping("/{quoteId}")
    @Operation(description = "Delete property quote by ID")
    public ResponseEntity<Void> deletePropertyQuoteById(@PathVariable Integer quoteId) {
        propertyQuoteService.deletePropertyQuoteById(quoteId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{quoteId}/accept")
    @Operation(description = "Accept a property quote")
    public ResponseEntity<Void> acceptQuote(@PathVariable Integer quoteId) {
        propertyQuoteService.acceptQuote(quoteId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{quoteId}/reject")
    @Operation(description = "Reject a property quote")
    public ResponseEntity<Void> rejectQuote(@PathVariable Integer quoteId) {
        propertyQuoteService.rejectQuote(quoteId);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}