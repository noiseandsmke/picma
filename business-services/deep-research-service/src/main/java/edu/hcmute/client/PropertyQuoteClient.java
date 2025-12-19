package edu.hcmute.client;

import edu.hcmute.dto.QuoteDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "PROPERTY-QUOTE-SERVICE", path = "/property-quote")
public interface PropertyQuoteClient {
    @GetMapping("/lead/{leadId}")
    List<QuoteDto> getQuotesByLeadId(@PathVariable Integer leadId);
}