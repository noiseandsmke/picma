package edu.hcmute;

import edu.hcmute.dto.PerilTypeDto;
import edu.hcmute.service.PerilTypeService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PerilTypeServiceTest extends PropertyQuoteServiceApplicationTests {
    PerilTypeDto perilTypeDto;
    @Autowired
    private PerilTypeService service;

    @BeforeEach
    public void init() {
        perilTypeDto = new PerilTypeDto();
        perilTypeDto.setType("Fire");
    }

    @Test
    void createPerilTypeTest() {
        PerilTypeDto savedPerilTypeDto = service.createPerilType(perilTypeDto);
        Assertions.assertNotNull(savedPerilTypeDto);
        Assertions.assertNotNull(savedPerilTypeDto.getId());
        Assertions.assertEquals(perilTypeDto.getType(), savedPerilTypeDto.getType());
    }
}