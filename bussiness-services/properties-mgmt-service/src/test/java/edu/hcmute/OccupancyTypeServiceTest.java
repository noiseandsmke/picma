package edu.hcmute;

import edu.hcmute.dto.OccupancyTypeDto;
import edu.hcmute.service.OccupancyTypeService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class OccupancyTypeServiceTest extends PropertiesMgmtServiceApplicationTests {
    OccupancyTypeDto oTypeDto = null;
    @Autowired
    private OccupancyTypeService oTypeService;

    @BeforeEach
    void setup() {
        oTypeDto = new OccupancyTypeDto();
        oTypeDto.setType("Rented");
    }

    @Test
    void testCreateOccupancyType() {
        OccupancyTypeDto oTypeDtoFetched = oTypeService.createOccupancyType(oTypeDto);
        Assertions.assertNotNull(oTypeDtoFetched);
        Assertions.assertNotEquals(0, oTypeDtoFetched.getId().length());
        Assertions.assertEquals(oTypeDto.getType(), oTypeDtoFetched.getType());
    }

    @Test
    void testGetOccupancyByType() {
        OccupancyTypeDto oTypeDtoFetched = oTypeService.getOccupancyByType("Rented");
        Assertions.assertNotNull(oTypeDtoFetched);
        Assertions.assertNotEquals(0, oTypeDtoFetched.getId().length());
        Assertions.assertEquals(oTypeDto.getType(), oTypeDtoFetched.getType());
    }

    @Test
    void testGetOccupancyById() {
        OccupancyTypeDto oTypeDtoFetched = oTypeService.getOccupancyById("68f90559cfcd50fd33e14caa");
        Assertions.assertNotNull(oTypeDtoFetched);
        Assertions.assertNotEquals(0, oTypeDtoFetched.getId().length());
        Assertions.assertEquals("68f90559cfcd50fd33e14caa", oTypeDtoFetched.getId());
    }
}