package edu.hcmute;

import edu.hcmute.dto.CoverageTypeDto;
import edu.hcmute.dto.PerilTypeDto;
import edu.hcmute.entity.CoverageType;
import edu.hcmute.entity.PerilType;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.CoverageTypeRepo;
import edu.hcmute.repo.PerilTypeRepo;
import edu.hcmute.service.CoverageTypeServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CoverageTypeServiceTest {
    @Mock
    private CoverageTypeRepo coverageTypeRepo;
    @Mock
    private PerilTypeRepo perilTypeRepo;
    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private CoverageTypeServiceImpl coverageTypeService;

    private CoverageTypeDto coverageTypeDto;
    private CoverageType coverageType;
    private List<PerilType> perilTypes;

    @BeforeEach
    public void init() {
        PerilType firePeril = new PerilType();
        firePeril.setId(4);
        firePeril.setType("Fire");

        PerilType typhoonPeril = new PerilType();
        typhoonPeril.setId(3);
        typhoonPeril.setType("Typhoon");

        perilTypes = List.of(firePeril, typhoonPeril);

        coverageTypeDto = new CoverageTypeDto();
        coverageTypeDto.setType("Platinum");

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

        coverageType = new CoverageType();
        coverageType.setId(1);
        coverageType.setType("Platinum");
        coverageType.setPerilTypeList(perilTypes);
    }

    @Test
    void createCoverageTypeTest() {
        when(propertyQuoteMapper.toEntity(any(CoverageTypeDto.class))).thenReturn(coverageType);
        when(coverageTypeRepo.save(any(CoverageType.class))).thenReturn(coverageType);

        // Must return a DTO with ID
        CoverageTypeDto resultDto = new CoverageTypeDto();
        resultDto.setId(1);
        resultDto.setType(coverageTypeDto.getType());
        resultDto.setPerilTypeList(coverageTypeDto.getPerilTypeList());

        when(propertyQuoteMapper.toDto(any(CoverageType.class))).thenReturn(resultDto);
        when(perilTypeRepo.findAllById(any())).thenReturn(perilTypes);

        CoverageTypeDto savedCoverageTypeDto = coverageTypeService.createCoverageType(coverageTypeDto);
        Assertions.assertNotNull(savedCoverageTypeDto);
        Assertions.assertEquals(1, savedCoverageTypeDto.getId());
        Assertions.assertEquals(coverageTypeDto.getType(), savedCoverageTypeDto.getType());
        Assertions.assertNotNull(savedCoverageTypeDto.getPerilTypeList());
        Assertions.assertEquals(2, savedCoverageTypeDto.getPerilTypeList().size());
    }
}