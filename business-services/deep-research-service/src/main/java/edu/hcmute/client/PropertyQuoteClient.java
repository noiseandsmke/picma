package edu.hcmute.client;

import edu.hcmute.dto.QuoteDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "property-quote-service", url = "${application.config.property-quote-url:http://localhost:7102}")
public interface PropertyQuoteClient {
    @GetMapping("/property-quote/lead/{leadId}")
    List<QuoteDto> getQuotesByLeadId(@PathVariable Integer leadId);
}