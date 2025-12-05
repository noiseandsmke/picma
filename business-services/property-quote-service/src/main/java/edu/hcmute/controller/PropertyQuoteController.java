package edu.hcmute.controller;

import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.service.PropertyQuoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
    @Operation(description = "Create a property quote for an existing lead", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDto> createPropertyQuote(@RequestBody PropertyQuoteDto propertyQuoteDto) {
        log.info("### Create Property Quote for leadId = {} ###", propertyQuoteDto.leadId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyQuoteService.createPropertyQuote(propertyQuoteDto));
    }

    @GetMapping
    @Operation(description = "Get all property quotes", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyQuoteDto>> getAllPropertyQuotes(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        log.info("### Get All Property Quotes ###");
        return ResponseEntity.ok(propertyQuoteService.getAllPropertyQuotes(sort, order));
    }

    @GetMapping("/{quoteId}")
    @Operation(description = "Get property quote by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDto> getPropertyQuoteById(@PathVariable Integer quoteId) {
        log.info("### Get Property Quote by id = {} ###", quoteId);
        return ResponseEntity.ok(propertyQuoteService.getPropertyQuoteById(quoteId));
    }

    @GetMapping("/lead/{leadId}")
    @Operation(description = "Get all property quotes for a lead", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyQuoteDto>> getQuotesByLeadId(@PathVariable Integer leadId) {
        log.info("### Get Property Quotes for leadId = {} ###", leadId);
        return ResponseEntity.ok(propertyQuoteService.getQuotesByLeadId(leadId));
    }

    @GetMapping("/agent/{agentId}")
    @Operation(description = "Get all property quotes for an agent", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyQuoteDto>> getQuotesByAgentId(@PathVariable String agentId) {
        log.info("### Get Property Quotes for agentId = {} ###", agentId);
        return ResponseEntity.ok(propertyQuoteService.getQuotesByAgentId(agentId));
    }

    @PutMapping("/{quoteId}")
    @Operation(description = "Update property quote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDto> updatePropertyQuote(@PathVariable Integer quoteId, @RequestBody PropertyQuoteDto propertyQuoteDto) {
        log.info("### Update Property Quote by id = {} ###", quoteId);
        return ResponseEntity.ok(propertyQuoteService.updatePropertyQuote(quoteId, propertyQuoteDto));
    }

    @DeleteMapping("/{quoteId}")
    @Operation(description = "Delete property quote by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deletePropertyQuoteById(@PathVariable Integer quoteId) {
        log.info("### Delete Property Quote by id = {} ###", quoteId);
        propertyQuoteService.deletePropertyQuoteById(quoteId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{quoteId}/accept")
    @Operation(description = "Accept a property quote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> acceptQuote(@PathVariable Integer quoteId) {
        log.info("### Accept Property Quote by id = {} ###", quoteId);
        propertyQuoteService.acceptQuote(quoteId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{quoteId}/reject")
    @Operation(description = "Reject a property quote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> rejectQuote(@PathVariable Integer quoteId) {
        log.info("### Reject Property Quote by id = {} ###", quoteId);
        propertyQuoteService.rejectQuote(quoteId);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}