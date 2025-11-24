package edu.hcmute;

import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.service.PropertyLeadService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public class PropertyLeadServiceTest extends PropertyLeadServiceApplicationTests {
    @Autowired
    private PropertyLeadService propertyLeadService;

    @Disabled
    @Test
    public void testCreateLeadByQuoteId() {
        PropertyLeadDto propertyLeadDto = propertyLeadService.createPropertyLeadByQuote(1);
        Assertions.assertNotNull(propertyLeadDto);
        Assertions.assertTrue(propertyLeadDto.id() > 0);
    }

    @Test
    public void testFetchPropertyLeadsByZipcode() {
        List<PropertyLeadDto> propertyLeads = propertyLeadService.findPropertyLeadsByZipcode("648877");
        Assertions.assertNotNull(propertyLeads);
        Assertions.assertNotEquals(0, propertyLeads.size());
    }
}