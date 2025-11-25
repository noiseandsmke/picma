package edu.hcmute.controller;

import edu.hcmute.dto.PropertyQuoteDetailDto;
import edu.hcmute.service.PropertyQuoteDetailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyQuoteControllerTest {

    @Mock
    private PropertyQuoteDetailService propertyQuoteDetailService;

    @InjectMocks
    private PropertyQuoteController propertyQuoteController;

    @Test
    void createPropertyQuote_shouldReturnCreatedQuote() {
        PropertyQuoteDetailDto inputDto = new PropertyQuoteDetailDto(null, null, null, null, null);
        PropertyQuoteDetailDto returnedDto = new PropertyQuoteDetailDto(1, null, null, null, null);

        when(propertyQuoteDetailService.createPropertyQuoteDetail(any(PropertyQuoteDetailDto.class))).thenReturn(returnedDto);

        ResponseEntity<PropertyQuoteDetailDto> response = propertyQuoteController.createPropertyQuote(inputDto);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(returnedDto, response.getBody());
        verify(propertyQuoteDetailService).createPropertyQuoteDetail(inputDto);
    }

    @Test
    void getAllPropertyQuote_shouldReturnListOfQuotes() {
        PropertyQuoteDetailDto quoteDto = new PropertyQuoteDetailDto(1, null, null, null, null);
        List<PropertyQuoteDetailDto> quoteList = Collections.singletonList(quoteDto);

        when(propertyQuoteDetailService.getAllPropertyQuoteDetail()).thenReturn(quoteList);

        ResponseEntity<List<PropertyQuoteDetailDto>> response = propertyQuoteController.getAllPropertyQuote();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(quoteList, response.getBody());
        verify(propertyQuoteDetailService).getAllPropertyQuoteDetail();
    }

    @Test
    void getPropertyQuoteById_shouldReturnQuote() {
        Integer quoteId = 1;
        PropertyQuoteDetailDto quoteDto = new PropertyQuoteDetailDto(quoteId, null, null, null, null);

        when(propertyQuoteDetailService.getPropertyQuoteDetailById(quoteId)).thenReturn(quoteDto);

        ResponseEntity<PropertyQuoteDetailDto> response = propertyQuoteController.getPropertyQuoteById(quoteId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(quoteDto, response.getBody());
        verify(propertyQuoteDetailService).getPropertyQuoteDetailById(quoteId);
    }
}