package edu.hcmute;

import edu.hcmute.dto.CoverageTypeDto;
import edu.hcmute.dto.PolicyTypeDto;
import edu.hcmute.entity.CoverageType;
import edu.hcmute.entity.PolicyType;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PolicyTypeRepo;
import edu.hcmute.service.PolicyTypeServiceImpl;
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
public class PolicyTypeServiceTest {
    @Mock
    private PolicyTypeRepo policyTypeRepo;

    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private PolicyTypeServiceImpl policyTypeService;

    private PolicyTypeDto policyTypeDto;
    private PolicyType policyType;

    @BeforeEach
    public void init() {
        CoverageTypeDto basicCoverageTypeDto = new CoverageTypeDto(2, "Basic", null);

        policyTypeDto = new PolicyTypeDto(null, "HO-3", basicCoverageTypeDto);

        policyType = new PolicyType();
        policyType.setId(1);
        policyType.setType("HO-3");

        CoverageType coverageType = new CoverageType();
        coverageType.setId(2);
        coverageType.setType("Basic");
        policyType.setCoverageType(coverageType);
    }

    @Test
    void createPolicyTypeTest() {
        when(propertyQuoteMapper.toEntity(any(PolicyTypeDto.class))).thenReturn(policyType);
        when(policyTypeRepo.save(any(PolicyType.class))).thenReturn(policyType);
        PolicyTypeDto resultDto = new PolicyTypeDto(1, "HO-3", policyTypeDto.coverageTypeDto());
        when(propertyQuoteMapper.toDto(any(PolicyType.class))).thenReturn(resultDto);

        PolicyTypeDto savedPolicyTypeDto = policyTypeService.createPolicyType(policyTypeDto);
        Assertions.assertNotNull(savedPolicyTypeDto);
        Assertions.assertEquals(1, savedPolicyTypeDto.id());
        Assertions.assertEquals(policyTypeDto.type(), savedPolicyTypeDto.type());
        Assertions.assertEquals(policyTypeDto.coverageTypeDto().type(), savedPolicyTypeDto.coverageTypeDto().type());
    }
}