package edu.hcmute;

import edu.hcmute.dto.ConstructionTypeDto;
import edu.hcmute.service.ConstructionTypeService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class ConstructionTypeServiceTest extends PropertiesMgmtServiceApplicationTests {
    ConstructionTypeDto cTypeDto = null;
    @Autowired
    private ConstructionTypeService cTypeService;

    @BeforeEach
    void setup() {
        cTypeDto = new ConstructionTypeDto();
        cTypeDto.setType("Wood");
    }

    @Test
    void testCreateConstructionType() {
        ConstructionTypeDto cTypeDtoFetched = cTypeService.createConstructionType(cTypeDto);
        Assertions.assertNotNull(cTypeDtoFetched);
        Assertions.assertNotEquals(0, cTypeDtoFetched.getId().length());
        Assertions.assertEquals(cTypeDto.getType(), cTypeDtoFetched.getType());
    }

    @Test
    void testGetConstructionByType() {
        ConstructionTypeDto cTypeDtoFetched = cTypeService.getConstructionByType("Wood");
        Assertions.assertNotNull(cTypeDtoFetched);
        Assertions.assertNotEquals(0, cTypeDtoFetched.getId().length());
        Assertions.assertEquals(cTypeDto.getType(), cTypeDtoFetched.getType());
    }

    @Test
    void testGetConstructionById() {
        ConstructionTypeDto cTypeDtoFetched = cTypeService.getConstructionById("68f902db7bfdc91d2510593b");
        Assertions.assertNotNull(cTypeDtoFetched);
        Assertions.assertNotEquals(0, cTypeDtoFetched.getId().length());
        Assertions.assertEquals("68f902db7bfdc91d2510593b", cTypeDtoFetched.getId());
    }
}