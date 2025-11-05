package edu.hcmute.controller;

import edu.hcmute.dto.PropertyQuoteDetailDto;
import edu.hcmute.service.PropertyQuoteDetailService;
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
    private final PropertyQuoteDetailService propertyQuoteDetailService;

    @PostMapping({"/property-quote", "/property-quote/"})
    @Operation(description = "createPropertyQuote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDetailDto> createPropertyQuote(@RequestBody PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Create Property Quote ###");
        log.info(propertyQuoteDetailDto.toString());
        return ResponseEntity.ok(propertyQuoteDetailService.createPropertyQuoteDetail(propertyQuoteDetailDto));
    }

    @GetMapping({"/property-quote", "/property-quote/"})
    @Operation(description = "getAllPropertyQuote", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<PropertyQuoteDetailDto>> getAllPropertyQuote() {
        log.info("### Get All Property Quote ###");
        return ResponseEntity.ok(propertyQuoteDetailService.getAllPropertyQuoteDetail());
    }

    @GetMapping({"/property-quote/{quoteId}"})
    @Operation(description = "getPropertyQuoteById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PropertyQuoteDetailDto> getPropertyQuoteById(@PathVariable Integer quoteId) {
        log.info("### Get Property Quote by Id = {} ###", quoteId);
        return ResponseEntity.ok(propertyQuoteDetailService.getPropertyQuoteDetailById(quoteId));
    }
}