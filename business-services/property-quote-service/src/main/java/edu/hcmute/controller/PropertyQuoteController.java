package edu.hcmute.controller;

import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.service.PropertyQuoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteController {
    private final PropertyQuoteService propertyQuoteService;

    @PostMapping({"/property-quote", "/property-quote/"})
    @Operation(description = "createPropertyQuote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDto> createPropertyQuote(@RequestBody PropertyQuoteDto propertyQuoteDto) {
        log.info("### Create Property Quote ###");
        log.info(propertyQuoteDto.toString());
        return ResponseEntity.ok(propertyQuoteService.createPropertyQuote(propertyQuoteDto));
    }

    @GetMapping({"/property-quote", "/property-quote/"})
    @Operation(description = "getAllPropertyQuote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyQuoteDto>> getAllPropertyQuote() {
        log.info("### Get All Property Quote ###");
        return ResponseEntity.ok(propertyQuoteService.getAllPropertyQuotes());
    }

    @GetMapping({"/property-quote/{quoteId}"})
    @Operation(description = "getPropertyQuoteById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDto> getPropertyQuoteById(@PathVariable Integer quoteId) {
        log.info("### Get Property Quote by Id = {} ###", quoteId);
        return ResponseEntity.ok(propertyQuoteService.getPropertyQuoteById(quoteId));
    }
}