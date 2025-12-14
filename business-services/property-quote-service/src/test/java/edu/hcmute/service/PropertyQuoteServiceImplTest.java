package edu.hcmute.service;

import edu.hcmute.domain.CoverageCode;
import edu.hcmute.domain.QuoteStatus;
import edu.hcmute.dto.CoverageDto;
import edu.hcmute.dto.CreatePropertyQuoteDto;
import edu.hcmute.dto.PremiumDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.Coverage;
import edu.hcmute.entity.Premium;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.stream.function.StreamBridge;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyQuoteServiceImplTest {
    @Mock
    private PropertyQuoteRepo propertyQuoteRepo;
    @Mock
    private PropertyQuoteMapper propertyQuoteMapper;
    @Mock
    private StreamBridge streamBridge;
    @Mock
    private PremiumCalculationService premiumCalculationService;

    @InjectMocks
    private PropertyQuoteServiceImpl propertyQuoteService;

    private PropertyQuoteDto createSampleDto() {
        return new PropertyQuoteDto(
                1, 1, "AGT-001", LocalDate.now().plusDays(30),
                LocalDate.of(2025, 12, 1), LocalDate.of(2026, 12, 1),
                "123 Main St", 2500000000L, QuoteStatus.ACTIVE,
                List.of(new CoverageDto(1, CoverageCode.FIRE, 2500000000L, 0L)),
                new PremiumDto(2000000L, 200000L, 2200000L)
        );
    }

    private PropertyQuote createSampleEntity() {
        PropertyQuote entity = new PropertyQuote();
        entity.setId(1);
        entity.setLeadId(1);
        entity.setAgentId("AGT-001");
        entity.setValidUntil(LocalDate.now().plusDays(30));
        entity.setStartDate(LocalDate.of(2025, 12, 1));
        entity.setEndDate(LocalDate.of(2026, 12, 1));
        entity.setPropertyAddress("123 Main St");
        entity.setSumInsured(2500000000L);
        entity.setStatus(QuoteStatus.ACTIVE);
        Coverage coverage = new Coverage(1, CoverageCode.FIRE, 2500000000L, 0L);
        entity.setCoverages(List.of(coverage));
        entity.setPremium(new Premium(2000000L, 200000L, 2200000L));
        return entity;
    }

    @Test
    void createPropertyQuote_success() {
        CreatePropertyQuoteDto inputDto = new CreatePropertyQuoteDto(
                1, "AGT-001", LocalDate.of(2025, 12, 1), LocalDate.of(2026, 12, 1),
                "123 Main St", List.of(new CoverageDto(null, CoverageCode.FIRE, 2500000000L, 0L))
        );
        PropertyQuote entity = createSampleEntity();
        PropertyQuoteDto resultDto = createSampleDto();
        
        when(propertyQuoteMapper.toEntity(inputDto)).thenReturn(entity);
        doNothing().when(premiumCalculationService).validateCoverages(any());
        when(premiumCalculationService.calculatePremium(any())).thenReturn(new Premium(2000000L, 200000L, 2200000L));
        when(premiumCalculationService.calculateSumInsured(any())).thenReturn(2500000000L);
        when(propertyQuoteRepo.save(any(PropertyQuote.class))).thenReturn(entity);
        when(propertyQuoteMapper.toDto(entity)).thenReturn(resultDto);
        when(streamBridge.send(anyString(), any())).thenReturn(true);
        
        PropertyQuoteDto result = propertyQuoteService.createPropertyQuote(inputDto);
        assertNotNull(result);
        assertEquals(1, result.id());
        verify(propertyQuoteRepo).save(any(PropertyQuote.class));
        verify(premiumCalculationService).validateCoverages(any());
        verify(premiumCalculationService).calculatePremium(any());
        verify(premiumCalculationService).calculateSumInsured(any());
        verify(streamBridge).send(eq("quoteCreated-out-0"), any());
    }

    @Test
    void getPropertyQuoteById_success() {
        PropertyQuote entity = createSampleEntity();
        PropertyQuoteDto resultDto = createSampleDto();
        when(propertyQuoteRepo.findById(1)).thenReturn(Optional.of(entity));
        when(propertyQuoteMapper.toDto(entity)).thenReturn(resultDto);
        PropertyQuoteDto result = propertyQuoteService.getPropertyQuoteById(1);
        assertNotNull(result);
        assertEquals(1, result.id());
    }

    @Test
    void deletePropertyQuoteById_success() {
        when(propertyQuoteRepo.existsById(1)).thenReturn(true);
        doNothing().when(propertyQuoteRepo).deleteById(1);
        assertDoesNotThrow(() -> propertyQuoteService.deletePropertyQuoteById(1));
        verify(propertyQuoteRepo).deleteById(1);
    }

    @Test
    void acceptQuote_shouldAcceptTargetAndRejectOthers() {
        PropertyQuote targetQuote = createSampleEntity();
        targetQuote.setId(1);
        targetQuote.setStatus(QuoteStatus.ACTIVE);
        PropertyQuote otherQuote = createSampleEntity();
        otherQuote.setId(2);
        otherQuote.setAgentId("AGT-002");
        otherQuote.setStatus(QuoteStatus.ACTIVE);
        when(propertyQuoteRepo.findById(1)).thenReturn(Optional.of(targetQuote));
        when(propertyQuoteRepo.findByLeadId(1)).thenReturn(List.of(targetQuote, otherQuote));
        when(streamBridge.send(anyString(), any())).thenReturn(true);
        propertyQuoteService.acceptQuote(1);
        assertEquals(QuoteStatus.ACCEPTED, targetQuote.getStatus());
        assertEquals(QuoteStatus.REJECTED, otherQuote.getStatus());
        verify(propertyQuoteRepo).save(targetQuote);
        verify(propertyQuoteRepo).save(otherQuote);
        verify(streamBridge).send(eq("quoteAccepted-out-0"), any(QuoteAcceptedEvent.class));
        verify(streamBridge).send(eq("quoteRejected-out-0"), any(QuoteRejectedEvent.class));
    }
}