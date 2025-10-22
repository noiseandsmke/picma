package edu.hcmute;

import edu.hcmute.dto.PropertyTypeDto;
import edu.hcmute.service.PropertyTypeService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;


public class PropertyTypeServiceTest extends PropertiesMgmtServiceApplicationTests {
    PropertyTypeDto propertyTypeDto = null;
    @Autowired
    private PropertyTypeService propertyTypeService;

    @BeforeEach
    public void setUp() {
        propertyTypeDto = new PropertyTypeDto();
        propertyTypeDto.setType("Commercial");
    }

    @Test
    public void testCreatePropertyType() {
        propertyTypeDto = propertyTypeService.createPropertyType(propertyTypeDto);
        Assertions.assertNotNull(propertyTypeDto);
    }
}