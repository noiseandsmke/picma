package edu.hcmute.controller;

import edu.hcmute.domain.LeadStatus;
import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.service.PropertyLeadService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyLeadControllerTest {

    @Mock
    private PropertyLeadService propertyLeadService;

    @InjectMocks
    private PropertyLeadController propertyLeadController;

    @Test
    void createLead_shouldReturnCreatedLead() {
        PropertyLeadDto inputDto = new PropertyLeadDto(null, "123", "P456", LeadStatus.ACTIVE, null, null);
        PropertyLeadDto returnedDto = new PropertyLeadDto(1, "123", "P456", LeadStatus.ACTIVE, null, null);

        when(propertyLeadService.createPropertyLead(any(PropertyLeadDto.class))).thenReturn(returnedDto);

        ResponseEntity<PropertyLeadDto> response = propertyLeadController.createLead(inputDto);

        assertNotNull(response);
        assertEquals(201, response.getStatusCodeValue());
        assertEquals(returnedDto, response.getBody());
    }

    @Test
    void getAllActiveLeads_shouldReturnListOfLeads() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", LeadStatus.ACTIVE, null, null);
        when(propertyLeadService.findAllPropertyLeads()).thenReturn(Collections.singletonList(leadDto));

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.getAllActiveLeads();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getAllLeads_shouldReturnListOfAllLeads() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", LeadStatus.EXPIRED, null, null);
        when(propertyLeadService.getAllLeads("id", "asc")).thenReturn(Collections.singletonList(leadDto));

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.getAllLeads("id", "asc");

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void getLeadStats_shouldReturnStats() {
        LeadStatsDto stats = new LeadStatsDto(10L, 5L, 2L, 3L);
        when(propertyLeadService.getLeadStats()).thenReturn(stats);

        ResponseEntity<LeadStatsDto> response = propertyLeadController.getLeadStats();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(stats, response.getBody());
    }

    @Test
    void getLeadById_shouldReturnLead() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", LeadStatus.ACTIVE, null, null);
        when(propertyLeadService.getPropertyLeadById(1)).thenReturn(leadDto);

        ResponseEntity<PropertyLeadDto> response = propertyLeadController.getLeadById(1);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadDto, response.getBody());
    }

    @Test
    void updateLeadStatus_shouldReturnUpdatedLead() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", LeadStatus.ACCEPTED, null, null);
        when(propertyLeadService.updateLeadStatus(1, "ACCEPTED")).thenReturn(leadDto);

        ResponseEntity<Object> response = propertyLeadController.updateLeadStatus(1, "ACCEPTED");

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void updateLeadStatus_missingHeader_shouldReturnBadRequest() {
        ResponseEntity<Object> response = propertyLeadController.updateLeadStatus(1, null);
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void deleteLeadById_shouldReturnNoContent() {
        doNothing().when(propertyLeadService).deletePropertyLeadById(1);

        ResponseEntity<Void> response = propertyLeadController.deleteLeadById(1);

        assertNotNull(response);
        assertEquals(204, response.getStatusCodeValue());
        verify(propertyLeadService).deletePropertyLeadById(1);
    }

    @Test
    void handleRuntimeException_shouldReturnBadRequest() {
        ResponseEntity<String> response = propertyLeadController.handleRuntimeException(new RuntimeException("Error"));
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Error", response.getBody());
    }
}
