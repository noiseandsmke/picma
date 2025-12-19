package edu.hcmute.client;

import edu.hcmute.dto.PropertyQuoteDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "PROPERTY-QUOTE-SERVICE", path = "/property-quote")
public interface PropertyQuoteFeignClient {
    @GetMapping("/lead/{leadId}")
    List<PropertyQuoteDto> getQuotesByLeadId(@PathVariable Integer leadId);
}