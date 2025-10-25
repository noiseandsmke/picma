package edu.hcmute;

import edu.hcmute.dto.QuoteTypeDto;
import edu.hcmute.service.QuoteTypeService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class QuoteTypeServiceTest extends PropertyQuoteServiceApplicationTests {
    QuoteTypeDto quoteTypeDto;
    @Autowired
    private QuoteTypeService service;

    @BeforeEach
    public void init() {
        quoteTypeDto = new QuoteTypeDto();
        quoteTypeDto.setType("Full application");
    }

    @Test
    void createQuoteTypeTest() {
        QuoteTypeDto savedQuoteTypeDto = service.createQuoteType(quoteTypeDto);
        Assertions.assertNotNull(savedQuoteTypeDto);
        Assertions.assertNotNull(savedQuoteTypeDto.getId());
        Assertions.assertEquals(quoteTypeDto.getType(), savedQuoteTypeDto.getType());
    }
}