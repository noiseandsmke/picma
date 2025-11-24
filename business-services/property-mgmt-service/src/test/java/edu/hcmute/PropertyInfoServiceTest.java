package edu.hcmute;

import edu.hcmute.dto.*;
import edu.hcmute.service.PropertyInfoService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyInfoServiceTest extends PropertyMgmtServiceApplicationTests {
    PropertyInfoDto propertyInfoDto = null;
    PropertyTypeDto propertyTypeDto = null;
    ConstructionTypeDto constructionTypeDto = null;
    OccupancyTypeDto occupancyTypeDto = null;
    PropertyAddressDto propertyAddressDto = null;
    @Autowired
    private PropertyInfoService propertyInfoService;

    @BeforeEach
    public void setUp() {
        propertyTypeDto = new PropertyTypeDto("Residential");
        constructionTypeDto = new ConstructionTypeDto("Wood");
        occupancyTypeDto = new OccupancyTypeDto("Coffee shop");
        propertyAddressDto = new PropertyAddressDto("648877", "St. Nguyen Chi Thanh", "GiaNghia", "LamDong", "VietNam");

        propertyInfoDto = new PropertyInfoDto(
                null,
                "60m2",
                2023,
                4,
                null,
                null,
                "69m",
                propertyTypeDto,
                propertyAddressDto,
                constructionTypeDto,
                occupancyTypeDto
        );
    }

    @Test
    public void testCreatePropertyInfo() {
        PropertyInfoDto createdProperty = propertyInfoService.createPropertyInfo(propertyInfoDto);
        Assertions.assertNotNull(createdProperty);
        Assertions.assertNotNull(createdProperty.id());
        Assertions.assertNotNull(createdProperty.propertyTypeDto().type());
        Assertions.assertNotNull(createdProperty.constructionTypeDto().type());
        Assertions.assertNotNull(createdProperty.occupancyTypeDto().type());
    }
}