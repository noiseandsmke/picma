package edu.hcmute;

import edu.hcmute.dto.PropertyAddressDto;
import edu.hcmute.service.PropertyAddressService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyAddressServiceTest extends PropertiesMgmtServiceApplicationTests {
    PropertyAddressDto propertyAddressDto = null;
    @Autowired
    private PropertyAddressService propertyAddressService;

    @BeforeEach
    void setup() {
        propertyAddressDto = new PropertyAddressDto();
        propertyAddressDto.setZipCode("12345");
        propertyAddressDto.setStreet("St. Tran Hung Dao");
        propertyAddressDto.setState("KienDuc");
        propertyAddressDto.setCity("LamDong");
        propertyAddressDto.setCountry("VietNam");
    }

    @Test
    void testAddUpdatePropertyAddress() {
        PropertyAddressDto createdAddressDto = propertyAddressService.addUpdatePropertyAddress(propertyAddressDto);
        Assertions.assertNotNull(createdAddressDto);
        Assertions.assertNotEquals(0, createdAddressDto.getId().length());
        Assertions.assertEquals(propertyAddressDto.getZipCode(), createdAddressDto.getZipCode());
    }
}