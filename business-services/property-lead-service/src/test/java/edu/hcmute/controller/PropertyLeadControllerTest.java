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

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyLeadControllerTest {
    private final LocalDate today = LocalDate.now();
    private final LocalDate expiryDate = today.plusDays(30);
    @Mock
    private PropertyLeadService propertyLeadService;
    @InjectMocks
    private PropertyLeadController propertyLeadController;

    @Test
    void createLead_withMinimalInput_shouldReturnCreatedLead() {
        PropertyLeadDto inputDto = new PropertyLeadDto(null, "user123", "property456", null, null, null);
        PropertyLeadDto returnedDto = new PropertyLeadDto(1, "user123", "property456", LeadStatus.ACTIVE, today, expiryDate);

        when(propertyLeadService.createPropertyLead(any(PropertyLeadDto.class))).thenReturn(returnedDto);

        ResponseEntity<PropertyLeadDto> response = propertyLeadController.createLead(inputDto);

        assertNotNull(response);
        assertEquals(201, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().id());
        assertEquals("user123", response.getBody().userInfo());
        assertEquals("property456", response.getBody().propertyInfo());
        assertEquals(LeadStatus.ACTIVE, response.getBody().status());
        assertEquals(today, response.getBody().createDate());
        assertEquals(expiryDate, response.getBody().expiryDate());
    }

    @Test
    void createLead_withFullInput_shouldIgnoreExtraFieldsAndReturnCreatedLead() {
        PropertyLeadDto inputDto = new PropertyLeadDto(999, "user123", "property456", LeadStatus.REJECTED, LocalDate.of(2020, 1, 1), LocalDate.of(2020, 2, 1));
        PropertyLeadDto returnedDto = new PropertyLeadDto(1, "user123", "property456", LeadStatus.ACTIVE, today, expiryDate);

        when(propertyLeadService.createPropertyLead(any(PropertyLeadDto.class))).thenReturn(returnedDto);

        ResponseEntity<PropertyLeadDto> response = propertyLeadController.createLead(inputDto);

        assertNotNull(response);
        assertEquals(201, response.getStatusCodeValue());
        assertEquals(1, response.getBody().id());
        assertEquals(LeadStatus.ACTIVE, response.getBody().status());
        assertEquals(today, response.getBody().createDate());
        assertEquals(expiryDate, response.getBody().expiryDate());
    }

    @Test
    void getAllActiveLeads_shouldReturnListOfLeads() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "user", "property", LeadStatus.ACTIVE, today, expiryDate);
        when(propertyLeadService.findAllPropertyLeads()).thenReturn(Collections.singletonList(leadDto));

        ResponseEntity<List<PropertyLeadDto>> response = propertyLeadController.getAllActiveLeads();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(LeadStatus.ACTIVE, response.getBody().get(0).status());
    }

    @Test
    void getAllLeads_shouldReturnListOfAllLeads() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "user", "property", LeadStatus.EXPIRED, today, expiryDate);
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
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "user", "property", LeadStatus.ACTIVE, today, expiryDate);
        when(propertyLeadService.getPropertyLeadById(1)).thenReturn(leadDto);

        ResponseEntity<PropertyLeadDto> response = propertyLeadController.getLeadById(1);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(leadDto, response.getBody());
    }

    @Test
    void updateLeadStatus_shouldReturnUpdatedLead() {
        PropertyLeadDto leadDto = new PropertyLeadDto(1, "user", "property", LeadStatus.ACCEPTED, today, expiryDate);
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
}
