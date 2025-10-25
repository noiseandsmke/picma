package edu.hcmute;

import edu.hcmute.dto.CoverageTypeDto;
import edu.hcmute.dto.PerilTypeDto;
import edu.hcmute.model.PerilType;
import edu.hcmute.repo.PerilTypeRepo;
import edu.hcmute.service.CoverageTypeService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

public class CoverageTypeServiceTest extends PropertyQuoteServiceApplicationTests {
    CoverageTypeDto coverageTypeDto;
    @Autowired
    private CoverageTypeService coverageTypeService;
    @Autowired
    private PerilTypeRepo perilTypeRepo;

    @BeforeEach
    public void init() {
        PerilType firePeril = perilTypeRepo.findById(1)
                .orElseThrow(() -> new RuntimeException("Fire PerilType not found with id 1"));

        PerilType typhoonPeril = perilTypeRepo.findById(3)
                .orElseThrow(() -> new RuntimeException("Typhoon PerilType not found with id 2"));

        coverageTypeDto = new CoverageTypeDto();
        coverageTypeDto.setType("Premium");

        PerilTypeDto firePerilDto = new PerilTypeDto();
        firePerilDto.setId(firePeril.getId());
        firePerilDto.setType(firePeril.getType());

        PerilTypeDto typhoonPerilDto = new PerilTypeDto();
        typhoonPerilDto.setId(typhoonPeril.getId());
        typhoonPerilDto.setType(typhoonPeril.getType());

        List<PerilTypeDto> perilList = new ArrayList<>();
        perilList.add(firePerilDto);
        perilList.add(typhoonPerilDto);
        coverageTypeDto.setPerilTypeList(perilList);
    }

    @Test
    void createCoverageTypeTest() {
        CoverageTypeDto savedCoverageTypeDto = coverageTypeService.createCoverageType(coverageTypeDto);
        Assertions.assertNotNull(savedCoverageTypeDto);
        Assertions.assertNotNull(savedCoverageTypeDto.getId());
        Assertions.assertEquals(coverageTypeDto.getType(), savedCoverageTypeDto.getType());
        Assertions.assertNotNull(savedCoverageTypeDto.getPerilTypeList());
        Assertions.assertEquals(2, savedCoverageTypeDto.getPerilTypeList().size());
    }
}