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
    @Operation(description = "createPropertyQuote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDetailDto> createPropertyQuote(@RequestBody PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Create Property Quote ###");
        log.info(propertyQuoteDetailDto.toString());
        return ResponseEntity.ok(propertyQuoteDetailService.createPropertyQuoteDetail(propertyQuoteDetailDto));
    }

    @GetMapping
    @Operation(description = "getAllPropertyQuote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyQuoteDetailDto>> getAllPropertyQuote(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order
    ) {
        log.info("### Get All Property Quote ###");
        return ResponseEntity.ok(propertyQuoteDetailService.getAllPropertyQuoteDetail(sort, order));
    }

    @GetMapping("/{quoteId}")
    @Operation(description = "getPropertyQuoteById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDetailDto> getPropertyQuoteById(@PathVariable Integer quoteId) {
        log.info("### Get Property Quote by Id = {} ###", quoteId);
        return ResponseEntity.ok(propertyQuoteDetailService.getPropertyQuoteDetailById(quoteId));
    }

    @PutMapping("/{quoteId}")
    @Operation(description = "updatePropertyQuote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDetailDto> updatePropertyQuote(@PathVariable Integer quoteId, @RequestBody PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Update Property Quote by Id = {} ###", quoteId);
        return ResponseEntity.ok(propertyQuoteDetailService.updatePropertyQuoteDetail(quoteId, propertyQuoteDetailDto));
    }

    @DeleteMapping("/{quoteId}")
    @Operation(description = "deletePropertyQuoteById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deletePropertyQuoteById(@PathVariable Integer quoteId) {
        log.info("### Delete Property Quote by Id = {} ###", quoteId);
        propertyQuoteDetailService.deletePropertyQuoteDetailById(quoteId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/types/quote")
    @Operation(description = "getAllQuoteTypes", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<QuoteTypeDto>> getAllQuoteTypes() {
        log.info("### Get All Quote Types ###");
        return ResponseEntity.ok(quoteTypeService.getAllQuoteTypes());
    }

    @GetMapping("/types/coverage")
    @Operation(description = "getAllCoverageTypes", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CoverageTypeDto>> getAllCoverageTypes() {
        log.info("### Get All Coverage Types ###");
        return ResponseEntity.ok(coverageTypeService.getAllCoverageTypes());
    }

    @GetMapping("/types/policy")
    @Operation(description = "getAllPolicyTypes", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PolicyTypeDto>> getAllPolicyTypes() {
        log.info("### Get All Policy Types ###");
        return ResponseEntity.ok(policyTypeService.getAllPolicyTypes());
    }
}