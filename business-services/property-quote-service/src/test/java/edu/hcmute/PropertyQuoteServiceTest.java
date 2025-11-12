package edu.hcmute;

import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.service.PropertyQuoteService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyQuoteServiceTest extends PropertyQuoteServiceApplicationTests {
    PropertyQuoteDto propertyQuoteDto;
    @Autowired
    private PropertyQuoteService service;

    @BeforeEach
    public void init() {
        propertyQuoteDto = new PropertyQuoteDto();
        propertyQuoteDto.setUserInfo("Duc Huy");
        propertyQuoteDto.setPropertyInfo("Honda Blade 110");
    }

    @Test
    void createPropertyQuoteTest() {
        PropertyQuoteDto savedPropertyQuoteDto = service.createPropertyQuote(propertyQuoteDto);
        Assertions.assertNotNull(savedPropertyQuoteDto);
        Assertions.assertNotNull(savedPropertyQuoteDto.getId());
    }
}