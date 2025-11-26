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
        PropertyQuoteDetailDto inputDto = new PropertyQuoteDetailDto(null, 1, null, null, null, null, null);
        PropertyQuoteDetailDto returnedDto = new PropertyQuoteDetailDto(1, 1, null, null, null, null, null);

        when(propertyQuoteDetailService.createPropertyQuoteDetail(any(PropertyQuoteDetailDto.class))).thenReturn(returnedDto);

        ResponseEntity<PropertyQuoteDetailDto> response = propertyQuoteController.createPropertyQuote(inputDto);

        assertNotNull(response);
        assertEquals(201, response.getStatusCodeValue());
        assertEquals(returnedDto, response.getBody());
    }

    @Test
    void getAllPropertyQuote_shouldReturnListOfQuotes() {
        PropertyQuoteDetailDto quoteDto = new PropertyQuoteDetailDto(1, 1, null, null, null, null, null);
        List<PropertyQuoteDetailDto> quoteList = Collections.singletonList(quoteDto);

        when(propertyQuoteDetailService.getAllPropertyQuoteDetail("id", "asc")).thenReturn(quoteList);

        ResponseEntity<List<PropertyQuoteDetailDto>> response = propertyQuoteController.getAllPropertyQuote("id", "asc");

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(quoteList, response.getBody());
    }

    @Test
    void getPropertyQuoteById_shouldReturnQuote() {
        PropertyQuoteDetailDto quoteDto = new PropertyQuoteDetailDto(1, 1, null, null, null, null, null);

        when(propertyQuoteDetailService.getPropertyQuoteDetailById(1)).thenReturn(quoteDto);

        ResponseEntity<PropertyQuoteDetailDto> response = propertyQuoteController.getPropertyQuoteById(1);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(quoteDto, response.getBody());
    }

    @Test
    void getQuotesByLeadId_shouldReturnQuotes() {
        PropertyQuoteDetailDto quoteDto = new PropertyQuoteDetailDto(1, 1, null, null, null, null, null);
        List<PropertyQuoteDetailDto> quoteList = Collections.singletonList(quoteDto);

        when(propertyQuoteDetailService.getQuotesByLeadId(1)).thenReturn(quoteList);

        ResponseEntity<List<PropertyQuoteDetailDto>> response = propertyQuoteController.getQuotesByLeadId(1);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(quoteList, response.getBody());
    }

    @Test
    void updatePropertyQuote_shouldReturnUpdatedQuote() {
        PropertyQuoteDetailDto inputDto = new PropertyQuoteDetailDto(1, 1, null, null, null, null, null);

        when(propertyQuoteDetailService.updatePropertyQuoteDetail(1, inputDto)).thenReturn(inputDto);

        ResponseEntity<PropertyQuoteDetailDto> response = propertyQuoteController.updatePropertyQuote(1, inputDto);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void deletePropertyQuoteById_shouldReturnNoContent() {
        ResponseEntity<Void> response = propertyQuoteController.deletePropertyQuoteById(1);

        assertNotNull(response);
        assertEquals(204, response.getStatusCodeValue());
        verify(propertyQuoteDetailService).deletePropertyQuoteDetailById(1);
    }
}
