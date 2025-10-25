package edu.hcmute;

import edu.hcmute.dto.CoverageTypeDto;
import edu.hcmute.dto.PolicyTypeDto;
import edu.hcmute.model.CoverageType;
import edu.hcmute.repo.CoverageTypeRepo;
import edu.hcmute.service.PolicyTypeService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PolicyTypeServiceTest extends PropertyQuoteServiceApplicationTests {
    PolicyTypeDto policyTypeDto;
    @Autowired
    private PolicyTypeService policyTypeService;
    @Autowired
    private CoverageTypeRepo coverageTypeRepo;

    @BeforeEach
    public void init() {
        CoverageType basicCoverageType = coverageTypeRepo.findById(2)
                .orElseThrow(() -> new RuntimeException("Basic Coverage Type not found with id 1"));
        CoverageTypeDto basicCoverageTypeDto = new CoverageTypeDto();
        basicCoverageTypeDto.setId(basicCoverageType.getId());
        basicCoverageTypeDto.setType(basicCoverageType.getType());

        policyTypeDto = new PolicyTypeDto();
        policyTypeDto.setType("HO-3");
        policyTypeDto.setCoverageTypeDto(basicCoverageTypeDto);
    }

    @Test
    void createPolicyTypeTest() {
        PolicyTypeDto savedPolicyTypeDto = policyTypeService.createPolicyType(policyTypeDto);
        Assertions.assertNotNull(savedPolicyTypeDto);
        Assertions.assertNotNull(savedPolicyTypeDto.getId());
        Assertions.assertEquals(policyTypeDto.getType(), savedPolicyTypeDto.getType());
        Assertions.assertEquals(policyTypeDto.getCoverageTypeDto().getType(), savedPolicyTypeDto.getCoverageTypeDto().getType());
    }
}