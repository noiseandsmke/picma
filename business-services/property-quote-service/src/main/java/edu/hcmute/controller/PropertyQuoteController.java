package edu.hcmute.controller;

import edu.hcmute.dto.CoverageTypeDto;
import edu.hcmute.dto.PolicyTypeDto;
import edu.hcmute.dto.PropertyQuoteDetailDto;
import edu.hcmute.dto.QuoteTypeDto;
import edu.hcmute.service.CoverageTypeService;
import edu.hcmute.service.PolicyTypeService;
import edu.hcmute.service.PropertyQuoteDetailService;
import edu.hcmute.service.QuoteTypeService;
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
    private final PropertyQuoteDetailService propertyQuoteDetailService;
    private final QuoteTypeService quoteTypeService;
    private final CoverageTypeService coverageTypeService;
    private final PolicyTypeService policyTypeService;

    @PostMapping
    @Operation(description = "Create a property quote for an existing lead", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDetailDto> createPropertyQuote(@RequestBody PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Create Property Quote for leadId = {} ###", propertyQuoteDetailDto.leadId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyQuoteDetailService.createPropertyQuoteDetail(propertyQuoteDetailDto));
    }

    @GetMapping
    @Operation(description = "Get all property quotes", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyQuoteDetailDto>> getAllPropertyQuote(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        log.info("### Get All Property Quotes ###");
        return ResponseEntity.ok(propertyQuoteDetailService.getAllPropertyQuoteDetail(sort, order));
    }

    @GetMapping("/{quoteId}")
    @Operation(description = "Get property quote by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDetailDto> getPropertyQuoteById(@PathVariable Integer quoteId) {
        log.info("### Get Property Quote by Id = {} ###", quoteId);
        return ResponseEntity.ok(propertyQuoteDetailService.getPropertyQuoteDetailById(quoteId));
    }

    @GetMapping("/lead/{leadId}")
    @Operation(description = "Get all property quotes for a lead", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyQuoteDetailDto>> getQuotesByLeadId(@PathVariable Integer leadId) {
        log.info("### Get Property Quotes for leadId = {} ###", leadId);
        return ResponseEntity.ok(propertyQuoteDetailService.getQuotesByLeadId(leadId));
    }

    @PutMapping("/{quoteId}")
    @Operation(description = "Update property quote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDetailDto> updatePropertyQuote(
            @PathVariable Integer quoteId,
            @RequestBody PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Update Property Quote by Id = {} ###", quoteId);
        return ResponseEntity.ok(propertyQuoteDetailService.updatePropertyQuoteDetail(quoteId, propertyQuoteDetailDto));
    }

    @DeleteMapping("/{quoteId}")
    @Operation(description = "Delete property quote by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deletePropertyQuoteById(@PathVariable Integer quoteId) {
        log.info("### Delete Property Quote by Id = {} ###", quoteId);
        propertyQuoteDetailService.deletePropertyQuoteDetailById(quoteId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/types/quote")
    @Operation(description = "Get all quote types", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<QuoteTypeDto>> getAllQuoteTypes() {
        return ResponseEntity.ok(quoteTypeService.getAllQuoteTypes());
    }

    @GetMapping("/types/coverage")
    @Operation(description = "Get all coverage types", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CoverageTypeDto>> getAllCoverageTypes() {
        return ResponseEntity.ok(coverageTypeService.getAllCoverageTypes());
    }

    @GetMapping("/types/policy")
    @Operation(description = "Get all policy types", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PolicyTypeDto>> getAllPolicyTypes() {
        return ResponseEntity.ok(policyTypeService.getAllPolicyTypes());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
