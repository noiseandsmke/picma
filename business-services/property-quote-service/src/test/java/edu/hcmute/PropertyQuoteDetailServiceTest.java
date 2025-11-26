package edu.hcmute;

import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.dto.*;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.entity.PropertyQuoteDetail;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteDetailRepo;
import edu.hcmute.service.PropertyQuoteDetailServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyQuoteDetailServiceTest {
    @Mock
    private PropertyQuoteDetailRepo propertyQuoteDetailRepo;
    @Mock
    private PropertyLeadFeignClient propertyLeadFeignClient;
    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;

    @InjectMocks
    private PropertyQuoteDetailServiceImpl propertyQuoteDetailService;

    private PropertyQuoteDetailDto propertyQuoteDetailDto;
    private PropertyQuoteDetail propertyQuoteDetail;
    private LeadInfoDto leadInfoDto;

    @BeforeEach
    public void init() {
        Integer leadId = 1;
        PropertyQuoteDto propertyQuoteDto = new PropertyQuoteDto(1, leadId, LocalDate.now(), LocalDate.now().plusDays(60));
        QuoteTypeDto quoteTypeDto = new QuoteTypeDto(2, "Type");
        CoverageTypeDto coverageTypeDto = new CoverageTypeDto(3, "Coverage", null);
        PolicyTypeDto policyTypeDto = new PolicyTypeDto(2, "Policy", null);

        leadInfoDto = new LeadInfoDto(leadId, "Duc Huy", "Honda Blade 110", "ACTIVE", LocalDate.now(), LocalDate.now().plusDays(30));

        propertyQuoteDetailDto = new PropertyQuoteDetailDto(null, leadId, propertyQuoteDto, quoteTypeDto, coverageTypeDto, policyTypeDto, null);

        propertyQuoteDetail = new PropertyQuoteDetail();
        propertyQuoteDetail.setId(1);

        PropertyQuote propertyQuote = PropertyQuote.builder()
                .id(1)
                .leadId(leadId)
                .createDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusDays(60))
                .build();
        propertyQuoteDetail.setPropertyQuote(propertyQuote);
    }

    @Test
    void createPropertyQuoteDetail_success() {
        when(propertyLeadFeignClient.getLeadById(anyInt())).thenReturn(leadInfoDto);
        when(propertyQuoteMapper.toEntity(any(PropertyQuoteDetailDto.class))).thenReturn(propertyQuoteDetail);
        when(propertyQuoteDetailRepo.save(any(PropertyQuoteDetail.class))).thenReturn(propertyQuoteDetail);

        PropertyQuoteDetailDto resultDto = new PropertyQuoteDetailDto(
                1, 1,
                propertyQuoteDetailDto.propertyQuoteDto(),
                propertyQuoteDetailDto.quoteTypeDto(),
                propertyQuoteDetailDto.coverageTypeDto(),
                propertyQuoteDetailDto.policyTypeDto(),
                null
        );
        when(propertyQuoteMapper.toDto(any(PropertyQuoteDetail.class))).thenReturn(resultDto);

        PropertyQuoteDetailDto saved = propertyQuoteDetailService.createPropertyQuoteDetail(propertyQuoteDetailDto);

        Assertions.assertNotNull(saved);
        Assertions.assertEquals(1, saved.id());
        Assertions.assertEquals(1, saved.leadId());
        Assertions.assertNotNull(saved.leadInfo());
        Assertions.assertEquals("Duc Huy", saved.leadInfo().userInfo());
    }

    @Test
    void createPropertyQuoteDetail_leadNotFound() {
        when(propertyLeadFeignClient.getLeadById(anyInt())).thenThrow(new RuntimeException("Lead not found"));

        Assertions.assertThrows(RuntimeException.class, () -> {
            propertyQuoteDetailService.createPropertyQuoteDetail(propertyQuoteDetailDto);
        });
    }

    @Test
    void createPropertyQuoteDetail_noLeadId() {
        PropertyQuoteDetailDto dtoWithoutLeadId = new PropertyQuoteDetailDto(null, null, null, null, null, null, null);

        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            propertyQuoteDetailService.createPropertyQuoteDetail(dtoWithoutLeadId);
        });
    }
}
