package edu.hcmute;

import edu.hcmute.dto.PerilTypeDto;
import edu.hcmute.entity.PerilType;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PerilTypeRepo;
import edu.hcmute.service.PerilTypeServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PerilTypeServiceTest {
    @Mock
    private PerilTypeRepo perilTypeRepo;
    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private PerilTypeServiceImpl service;

    private PerilTypeDto perilTypeDto;
    private PerilType perilType;

    @BeforeEach
    public void init() {
        perilTypeDto = new PerilTypeDto();
        perilTypeDto.setType("Fire");

        perilType = new PerilType();
        perilType.setId(1);
        perilType.setType("Fire");
    }

    @Test
    void createPerilTypeTest() {
        when(propertyQuoteMapper.toEntity(any(PerilTypeDto.class))).thenReturn(perilType);
        when(perilTypeRepo.save(any(PerilType.class))).thenReturn(perilType);
        when(propertyQuoteMapper.toDto(any(PerilType.class))).thenReturn(perilTypeDto);
        perilTypeDto.setId(1);

        PerilTypeDto savedPerilTypeDto = service.createPerilType(perilTypeDto);
        Assertions.assertNotNull(savedPerilTypeDto);
        Assertions.assertEquals(1, savedPerilTypeDto.getId());
        Assertions.assertEquals(perilTypeDto.getType(), savedPerilTypeDto.getType());
    }
}