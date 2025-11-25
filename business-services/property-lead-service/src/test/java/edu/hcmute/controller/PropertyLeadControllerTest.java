package edu.hcmute.controller;

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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyLeadControllerTest {

    @Mock
    private PropertyLeadService propertyLeadService;

    @InjectMocks
    private PropertyLeadController propertyLeadController;

    @Test
    void createLead_shouldReturnCreatedLead() {
        PropertyLeadDto inputDto = new PropertyLeadDto(null, "123", "P456", "ACTIVE", null, null);
        PropertyLeadDto returnedDto = new PropertyLeadDto(1, "123", "P456", "ACTIVE", null, null);

        when(propertyLeadService.createOrUpdatePropertyLead(any(PropertyLeadDto.class))).thenReturn(returnedDto);

        ResponseEntity<PropertyLeadDto> response = propertyLeadController.createLead(inputDto);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(returnedDto, response.getBody());
        verify(propertyLeadService).createOrUpdatePropertyLead(inputDto);
    }

    @Test
    void getAllActiveLeads_shouldReturnListOfLeads() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", "ACTIVE", null, null);
        List<PropertyLeadDto> leadList = Collections.singletonList(leadDto);

        when(propertyLeadService.findAllPropertyLeads()).thenReturn(leadList);

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.getAllActiveLeads();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadList, response.getBody());
        verify(propertyLeadService).findAllPropertyLeads();
    }

    @Test
    void getAllLeads_shouldReturnListOfAllLeads() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", "EXPIRED", null, null);
        List<PropertyLeadDto> leadList = Collections.singletonList(leadDto);

        when(propertyLeadService.getAllLeads()).thenReturn(leadList);

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.getAllLeads();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadList, response.getBody());
        verify(propertyLeadService).getAllLeads();
    }

    @Test
    void getLeadStats_shouldReturnStats() {
        LeadStatsDto stats = new LeadStatsDto(10L, 5L, 2L, 3L);
        when(propertyLeadService.getLeadStats()).thenReturn(stats);

        ResponseEntity<LeadStatsDto> response = propertyLeadController.getLeadStats();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(stats, response.getBody());
        verify(propertyLeadService).getLeadStats();
    }

    @Test
    void getLeadById_shouldReturnLead() {
        Integer leadId = 1;
        PropertyLeadDto leadDto = new PropertyLeadDto(leadId, "123", "P456", "ACTIVE", null, null);
        when(propertyLeadService.getPropertyLeadById(leadId)).thenReturn(leadDto);

        ResponseEntity<PropertyLeadDto> response = propertyLeadController.getLeadById(leadId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadDto, response.getBody());
        verify(propertyLeadService).getPropertyLeadById(leadId);
    }

    @Test
    void getLeadsByStatus_shouldReturnLeads() {
        String status = "ACTIVE";
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", "ACTIVE", null, null);
        List<PropertyLeadDto> leadList = Collections.singletonList(leadDto);

        when(propertyLeadService.findPropertyLeadsByStatus(status)).thenReturn(leadList);

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.getLeadsByStatus(status);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadList, response.getBody());
        verify(propertyLeadService).findPropertyLeadsByStatus(status);
    }

    @Test
    void getAllLeadsByZipCode_shouldReturnLeads() {
        String zipCode = "12345";
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", "ACTIVE", null, null);
        List<PropertyLeadDto> leadList = Collections.singletonList(leadDto);

        when(propertyLeadService.findPropertyLeadsByZipcode(zipCode)).thenReturn(leadList);

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.getAllLeadsByZipCode(zipCode);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadList, response.getBody());
        verify(propertyLeadService).findPropertyLeadsByZipcode(zipCode);
    }

    @Test
    void getLeadsByAgent_shouldReturnLeads() {
        String agentId = "agent1";
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "123", "P456", "ACTIVE", null, null);
        List<PropertyLeadDto> leadList = Collections.singletonList(leadDto);

        when(propertyLeadService.findPropertyLeadsOfAgent(agentId)).thenReturn(leadList);

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.getLeadsByAgent(agentId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadList, response.getBody());
        verify(propertyLeadService).findPropertyLeadsOfAgent(agentId);
    }

    @Test
    void updateLeadStatus_shouldReturnUpdatedLead() {
        Integer leadId = 1;
        String status = "ACCEPTED";
        PropertyLeadDto leadDto = new PropertyLeadDto(leadId, "123", "P456", "ACCEPTED", null, null);

        when(propertyLeadService.updateLeadStatus(leadId, status)).thenReturn(leadDto);

        ResponseEntity<Object> response = propertyLeadController.updateLeadStatus(leadId, status);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadDto, response.getBody());
        verify(propertyLeadService).updateLeadStatus(leadId, status);
    }

    @Test
    void updateLeadStatus_missingHeader_shouldReturnBadRequest() {
        ResponseEntity<Object> response = propertyLeadController.updateLeadStatus(1, null);
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Header lead-status must be present", response.getBody());
    }

    @Test
    void deleteLeadById_shouldReturnRemainingLeads() {
        Integer leadId = 1;
        List<PropertyLeadDto> remainingLeads = Collections.emptyList();
        when(propertyLeadService.deletePropertyLeadById(leadId)).thenReturn(remainingLeads);

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.deleteLeadById(leadId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(remainingLeads, response.getBody());
        verify(propertyLeadService).deletePropertyLeadById(leadId);
    }

    @Test
    void handleRuntimeException_shouldReturnBadRequest() {
        ResponseEntity<String> response = propertyLeadController.handleRuntimeException(new RuntimeException("Error"));
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Error", response.getBody());
    }
}