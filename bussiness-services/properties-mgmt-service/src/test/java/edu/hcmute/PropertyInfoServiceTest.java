package edu.hcmute;

import edu.hcmute.dto.*;
import edu.hcmute.service.PropertyInfoService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyInfoServiceTest extends PropertiesMgmtServiceApplicationTests {
    PropertyInfoDto propertyInfoDto = null;
    PropertyTypeDto propertyTypeDto = null;
    ConstructionTypeDto constructionTypeDto = null;
    OccupancyTypeDto occupancyTypeDto = null;
    PropertyAddressDto propertyAddressDto = null;
    @Autowired
    private PropertyInfoService propertyInfoService;

    @BeforeEach
    public void setUp() {
        propertyInfoDto = new PropertyInfoDto();
        propertyInfoDto.setNoFloors(4);
        propertyInfoDto.setMarketValue("69m");
        propertyInfoDto.setSquareMeters("60m2");
        propertyInfoDto.setYearBuilt(2023);

        propertyTypeDto = new PropertyTypeDto();
        propertyTypeDto.setType("Residential");
        propertyInfoDto.setPropertyTypeDto(propertyTypeDto);

        constructionTypeDto = new ConstructionTypeDto();
        constructionTypeDto.setType("Wood");
        propertyInfoDto.setConstructionTypeDto(constructionTypeDto);

        occupancyTypeDto = new OccupancyTypeDto();
        occupancyTypeDto.setType("Coffee shop");
        propertyInfoDto.setOccupancyTypeDto(occupancyTypeDto);

        propertyAddressDto = new PropertyAddressDto();
        propertyAddressDto.setZipCode("648877");
        propertyAddressDto.setStreet("St. Nguyen Chi Thanh");
        propertyAddressDto.setState("GiaNghia");
        propertyAddressDto.setCity("LamDong");
        propertyAddressDto.setCountry("VietNam");
        propertyInfoDto.setPropertyAddressDto(propertyAddressDto);
    }

    @Test
    public void testCreatePropertyInfo() {
        PropertyInfoDto createdProperty = propertyInfoService.createPropertyInfo(propertyInfoDto);
        Assertions.assertNotNull(createdProperty);
        Assertions.assertNotNull(createdProperty.getId());
        Assertions.assertNotNull(createdProperty.getPropertyTypeDto().getType());
        Assertions.assertNotNull(createdProperty.getConstructionTypeDto().getType());
        Assertions.assertNotNull(createdProperty.getOccupancyTypeDto().getType());
    }
}