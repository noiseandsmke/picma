package edu.hcmute;

import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.service.PropertyLeadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyLeadServiceTest extends PropertyLeadServiceApplicationTests {
    @Autowired
    private PropertyLeadService propertyLeadService;

    @Test
    public void testCreateLeadByQuoteId() {
        PropertyLeadDto propertyLeadDto = propertyLeadService.createPropertyLeadByQuote(2);
//        Assertions.assertNotNull(propertyLeadDto);
//        Assertions.assertTrue(propertyLeadDto.getId() > 0);q
    }
}