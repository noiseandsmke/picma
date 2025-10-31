package edu.hcmute;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.service.PropertyInfoService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyInfoServiceTest extends PropertyQuoteServiceApplicationTests {
    PropertyInfoDto propertyInfoDto;
    @Autowired
    private PropertyInfoService service;

    @BeforeEach
    public void init() {
        propertyInfoDto = new PropertyInfoDto();
        propertyInfoDto.setUserInfo("DucHuy");
        propertyInfoDto.setPropertyInfo("House");
    }

    @Test
    void createPropertyInfoTest() {
        PropertyInfoDto savedPropertyInfoDto = service.createPropertyInfo(propertyInfoDto);
        Assertions.assertNotNull(savedPropertyInfoDto);
        Assertions.assertNotNull(savedPropertyInfoDto.getId());
    }
}