package edu.hcmute.controller;

import edu.hcmute.domain.CoverageCode;
import edu.hcmute.domain.PlanType;
import edu.hcmute.domain.QuoteStatus;
import edu.hcmute.dto.CoverageDto;
import edu.hcmute.dto.PremiumDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.service.PropertyQuoteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyQuoteControllerTest {

    @Mock
    private PropertyQuoteService propertyQuoteService;

    @InjectMocks
    private PropertyQuoteController propertyQuoteController;

    private PropertyQuoteDto createSampleDto() {
        return new PropertyQuoteDto(
                1, 1, "AGT-001", "Agent Name", LocalDate.now().plusDays(30),
                LocalDate.of(2025, 12, 1), LocalDate.of(2026, 12, 1),
                "123 Main St", 2500000000L, PlanType.SILVER, QuoteStatus.PENDING,
                List.of(new CoverageDto(1, CoverageCode.FIRE, 2500000000L, 0L)),
                new PremiumDto(2000000L, 200000L, 2200000L)
        );
    }

    @Test
    void createPropertyQuote_shouldReturnCreatedQuote() {
        PropertyQuoteDto inputDto = new PropertyQuoteDto(null, 1, "AGT-001", "Agent Name", null,
                LocalDate.of(2025, 12, 1), LocalDate.of(2026, 12, 1),
                "123 Main St", 2500000000L, PlanType.SILVER, null,
                List.of(new CoverageDto(null, CoverageCode.FIRE, 2500000000L, 0L)),
                new PremiumDto(2000000L, 200000L, 2200000L));
        PropertyQuoteDto returnedDto = createSampleDto();
        when(propertyQuoteService.createPropertyQuote(any(PropertyQuoteDto.class))).thenReturn(returnedDto);
        ResponseEntity<PropertyQuoteDto> response = propertyQuoteController.createPropertyQuote(inputDto);
        assertNotNull(response);
        assertEquals(201, response.getStatusCodeValue());
        assertEquals(PlanType.SILVER, response.getBody().plan());
    }

    @Test
    void getAllPropertyQuotes_shouldReturnListOfQuotes() {
        List<PropertyQuoteDto> quoteList = Collections.singletonList(createSampleDto());
        when(propertyQuoteService.getAllPropertyQuotes("id", "asc")).thenReturn(quoteList);
        ResponseEntity<List<PropertyQuoteDto>> response = propertyQuoteController.getAllPropertyQuotes("id", "asc");
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getPropertyQuoteById_shouldReturnQuote() {
        PropertyQuoteDto quoteDto = createSampleDto();
        when(propertyQuoteService.getPropertyQuoteById(1)).thenReturn(quoteDto);
        ResponseEntity<PropertyQuoteDto> response = propertyQuoteController.getPropertyQuoteById(1);
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(quoteDto, response.getBody());
    }

    @Test
    void getQuotesByLeadId_shouldReturnQuotes() {
        List<PropertyQuoteDto> quoteList = Collections.singletonList(createSampleDto());
        when(propertyQuoteService.getQuotesByLeadId(1)).thenReturn(quoteList);
        ResponseEntity<List<PropertyQuoteDto>> response = propertyQuoteController.getQuotesByLeadId(1);
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void updatePropertyQuote_shouldReturnUpdatedQuote() {
        PropertyQuoteDto inputDto = createSampleDto();
        when(propertyQuoteService.updatePropertyQuote(1, inputDto)).thenReturn(inputDto);
        ResponseEntity<PropertyQuoteDto> response = propertyQuoteController.updatePropertyQuote(1, inputDto);
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void deletePropertyQuoteById_shouldReturnNoContent() {
        doNothing().when(propertyQuoteService).deletePropertyQuoteById(1);
        ResponseEntity<Void> response = propertyQuoteController.deletePropertyQuoteById(1);
        assertNotNull(response);
        assertEquals(204, response.getStatusCodeValue());
        verify(propertyQuoteService).deletePropertyQuoteById(1);
    }
}