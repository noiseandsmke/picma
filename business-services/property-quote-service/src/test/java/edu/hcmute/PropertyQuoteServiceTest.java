package edu.hcmute;

import edu.hcmute.dto.*;
import edu.hcmute.entity.CoverageType;
import edu.hcmute.entity.PolicyType;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.entity.QuoteType;
import edu.hcmute.repo.CoverageTypeRepo;
import edu.hcmute.repo.PolicyTypeRepo;
import edu.hcmute.repo.PropertyInfoRepo;
import edu.hcmute.repo.QuoteTypeRepo;
import edu.hcmute.service.PropertyQuoteService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyQuoteServiceTest extends PropertyQuoteServiceApplicationTests {
    PropertyQuoteDto propertyQuoteDto;
    @Autowired
    private PropertyQuoteService propertyQuoteService;
    @Autowired
    private PropertyInfoRepo propertyInfoRepo;
    @Autowired
    private QuoteTypeRepo quoteTypeRepo;
    @Autowired
    private CoverageTypeRepo coverageTypeRepo;
    @Autowired
    private PolicyTypeRepo policyTypeRepo;

    @BeforeEach
    public void init() {
        propertyQuoteDto = new PropertyQuoteDto();

        PropertyInfo propertyInfo = propertyInfoRepo.findById(2)
                .orElseThrow(() -> new RuntimeException("Not found property info"));
        PropertyInfoDto propertyInfoDto = new PropertyInfoDto();
        propertyInfoDto.setId(propertyInfo.getId());
        propertyInfoDto.setUserInfo(propertyInfo.getUserInfo());
        propertyInfoDto.setPropertyInfo(propertyInfo.getPropertyInfo());
        propertyQuoteDto.setPropertyInfoDto(propertyInfoDto);

        QuoteType quoteType = quoteTypeRepo.findById(1)
                .orElseThrow(() -> new RuntimeException("Not found quote type"));
        QuoteTypeDto quoteTypeDto = new QuoteTypeDto();
        quoteTypeDto.setId(quoteType.getId());
        quoteTypeDto.setType(quoteType.getType());
        propertyQuoteDto.setQuoteTypeDto(quoteTypeDto);

        CoverageType coverageType = coverageTypeRepo.findById(2)
                .orElseThrow(() -> new RuntimeException("Not found coverage type"));
        CoverageTypeDto coverageTypeDto = new CoverageTypeDto();
        coverageTypeDto.setId(coverageType.getId());
        coverageTypeDto.setType(coverageType.getType());
        propertyQuoteDto.setCoverageTypeDto(coverageTypeDto);

        PolicyType policyType = policyTypeRepo.findById(1)
                .orElseThrow(() -> new RuntimeException("Not found policy type"));
        PolicyTypeDto policyTypeDto = new PolicyTypeDto();
        policyTypeDto.setId(policyType.getId());
        policyTypeDto.setType(policyType.getType());
        propertyQuoteDto.setPolicyTypeDto(policyTypeDto);
    }

    @Test
    void createPropertyQuoteTest() {
        PropertyQuoteDto savedPropertyQuoteDto = propertyQuoteService.createPropertyQuote(propertyQuoteDto);

        Assertions.assertNotNull(savedPropertyQuoteDto);
        Assertions.assertNotNull(savedPropertyQuoteDto.getId());
        Assertions.assertNotNull(savedPropertyQuoteDto.getPropertyInfoDto());
        Assertions.assertNotNull(savedPropertyQuoteDto.getQuoteTypeDto());
        Assertions.assertNotNull(savedPropertyQuoteDto.getCoverageTypeDto());
        Assertions.assertNotNull(savedPropertyQuoteDto.getPolicyTypeDto());
    }
}