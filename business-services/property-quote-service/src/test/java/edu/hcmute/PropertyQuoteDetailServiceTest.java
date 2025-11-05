package edu.hcmute;

import edu.hcmute.dto.*;
import edu.hcmute.entity.*;
import edu.hcmute.repo.*;
import edu.hcmute.service.PropertyQuoteDetailService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyQuoteDetailServiceTest extends PropertyQuoteServiceApplicationTests {
    PropertyQuoteDetailDto propertyQuoteDetailDto;
    @Autowired
    private PropertyQuoteDetailService propertyQuoteDetailService;
    @Autowired
    private PropertyQuoteRepo propertyQuoteRepo;
    @Autowired
    private QuoteTypeRepo quoteTypeRepo;
    @Autowired
    private CoverageTypeRepo coverageTypeRepo;
    @Autowired
    private PolicyTypeRepo policyTypeRepo;
    @Autowired
    private PropertyLeadRepo propertyLeadRepo;

    @BeforeEach
    public void init() {
        propertyQuoteDetailDto = new PropertyQuoteDetailDto();

        PropertyQuote propertyQuote = propertyQuoteRepo.findById(4)
                .orElseThrow(() -> new RuntimeException("Not found property info"));
        PropertyQuoteDto propertyQuoteDto = new PropertyQuoteDto();
        propertyQuoteDto.setId(propertyQuote.getId());
        propertyQuoteDto.setUserInfo(propertyQuote.getUserInfo());
        propertyQuoteDto.setPropertyInfo(propertyQuote.getPropertyInfo());

//        propertyInfoDto.setUserInfo("Duc Huy");
//        propertyInfoDto.setPropertyInfo("Villa Vip Pro");
        propertyQuoteDetailDto.setPropertyQuoteDto(propertyQuoteDto);

        QuoteType quoteType = quoteTypeRepo.findById(2)
                .orElseThrow(() -> new RuntimeException("Not found quote type"));
        QuoteTypeDto quoteTypeDto = new QuoteTypeDto();
        quoteTypeDto.setId(quoteType.getId());
        quoteTypeDto.setType(quoteType.getType());
        propertyQuoteDetailDto.setQuoteTypeDto(quoteTypeDto);

        CoverageType coverageType = coverageTypeRepo.findById(3)
                .orElseThrow(() -> new RuntimeException("Not found coverage type"));
        CoverageTypeDto coverageTypeDto = new CoverageTypeDto();
        coverageTypeDto.setId(coverageType.getId());
        coverageTypeDto.setType(coverageType.getType());
        propertyQuoteDetailDto.setCoverageTypeDto(coverageTypeDto);

        PolicyType policyType = policyTypeRepo.findById(2)
                .orElseThrow(() -> new RuntimeException("Not found policy type"));
        PolicyTypeDto policyTypeDto = new PolicyTypeDto();
        policyTypeDto.setId(policyType.getId());
        policyTypeDto.setType(policyType.getType());
        propertyQuoteDetailDto.setPolicyTypeDto(policyTypeDto);
    }

    @Disabled
    @Test
    void createPropertyQuoteTest() {
        PropertyQuoteDetailDto savedPropertyQuoteDetailDto = propertyQuoteDetailService.createPropertyQuoteDetail(propertyQuoteDetailDto);

        Assertions.assertNotNull(savedPropertyQuoteDetailDto);
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.getId());
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.getPropertyQuoteDto());
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.getQuoteTypeDto());
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.getCoverageTypeDto());
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.getPolicyTypeDto());
    }

    public void testUpdatePropertyLead() {
        PropertyLead propertyLead = propertyLeadRepo.findById(3).orElseThrow(() -> new RuntimeException("Not found property lead"));
        propertyLead.setPropertyInfo("140205");
        propertyLeadRepo.save(propertyLead);
        Assertions.assertNotNull(propertyLead);

    }
}