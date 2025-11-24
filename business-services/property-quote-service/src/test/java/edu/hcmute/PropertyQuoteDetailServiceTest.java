package edu.hcmute;

import edu.hcmute.dto.*;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.entity.PropertyLeadDetail;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.entity.PropertyQuoteDetail;
import edu.hcmute.event.PropertyLeadProducer;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyLeadDetailRepo;
import edu.hcmute.repo.PropertyLeadRepo;
import edu.hcmute.repo.PropertyQuoteDetailRepo;
import edu.hcmute.service.PropertyQuoteDetailServiceImpl;
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
public class PropertyQuoteDetailServiceTest {
    @Mock
    private PropertyQuoteDetailRepo propertyQuoteDetailRepo;
    @Mock
    private PropertyLeadRepo propertyLeadRepo;
    @Mock
    private PropertyLeadDetailRepo propertyLeadDetailRepo;
    @Mock
    private PropertyLeadProducer leadProducer;
    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private PropertyQuoteDetailServiceImpl propertyQuoteDetailService;

    private PropertyQuoteDetailDto propertyQuoteDetailDto;
    private PropertyQuoteDetail propertyQuoteDetail;

    @BeforeEach
    public void init() {
        PropertyQuoteDto propertyQuoteDto = new PropertyQuoteDto(1, "Duc Huy", "Honda Blade 110");
        QuoteTypeDto quoteTypeDto = new QuoteTypeDto(2, "Type");
        CoverageTypeDto coverageTypeDto = new CoverageTypeDto(3, "Coverage", null);
        PolicyTypeDto policyTypeDto = new PolicyTypeDto(2, "Policy", null);

        propertyQuoteDetailDto = new PropertyQuoteDetailDto(null, propertyQuoteDto, quoteTypeDto, coverageTypeDto, policyTypeDto);

        propertyQuoteDetail = new PropertyQuoteDetail();
        propertyQuoteDetail.setId(1);

        PropertyQuote propertyQuote = new PropertyQuote();
        propertyQuote.setId(1);
        propertyQuote.setUserInfo("Duc Huy");
        propertyQuote.setPropertyInfo("Honda Blade 110");
        propertyQuoteDetail.setPropertyQuote(propertyQuote);
    }

    @Test
    void createPropertyQuoteTest() {
        when(propertyQuoteMapper.toEntity(any(PropertyQuoteDetailDto.class))).thenReturn(propertyQuoteDetail);
        when(propertyQuoteDetailRepo.save(any(PropertyQuoteDetail.class))).thenReturn(propertyQuoteDetail);

        PropertyQuoteDetailDto resultDto = new PropertyQuoteDetailDto(
                1,
                propertyQuoteDetailDto.propertyQuoteDto(),
                propertyQuoteDetailDto.quoteTypeDto(),
                propertyQuoteDetailDto.coverageTypeDto(),
                propertyQuoteDetailDto.policyTypeDto()
        );

        when(propertyQuoteMapper.toDto(any(PropertyQuoteDetail.class))).thenReturn(resultDto);

        PropertyLead propertyLead = new PropertyLead();
        propertyLead.setId(1);
        when(propertyLeadRepo.save(any(PropertyLead.class))).thenReturn(propertyLead);

        PropertyLeadDetail propertyLeadDetail = new PropertyLeadDetail();
        propertyLeadDetail.setId(1); // Ensure ID is set
        when(propertyLeadDetailRepo.save(any(PropertyLeadDetail.class))).thenReturn(propertyLeadDetail);

        when(leadProducer.produceLead(any(PropertyLead.class))).thenReturn(true);

        PropertyQuoteDetailDto savedPropertyQuoteDetailDto = propertyQuoteDetailService.createPropertyQuoteDetail(propertyQuoteDetailDto);

        Assertions.assertNotNull(savedPropertyQuoteDetailDto);
        Assertions.assertEquals(1, savedPropertyQuoteDetailDto.id());
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.propertyQuoteDto());
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.quoteTypeDto());
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.coverageTypeDto());
        Assertions.assertNotNull(savedPropertyQuoteDetailDto.policyTypeDto());
    }
}