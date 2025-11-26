package edu.hcmute.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyAgentFeignClient;
import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.domain.LeadStatus;
import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.event.PropertyLeadProducer;
import edu.hcmute.mapper.PropertyLeadMapper;
import edu.hcmute.repo.PropertyLeadRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyLeadServiceImplTest {
    private final LocalDate today = LocalDate.now();
    private final LocalDate expiryDate = today.plusDays(30);
    @Mock
    private PropertyLeadRepo propertyLeadRepo;
    @Mock
    private PropertyLeadMapper propertyLeadMapper;
    @Mock
    private PropertyLeadProducer propertyLeadProducer;
    @Mock
    private PropertyMgmtFeignClient propertyMgmtFeignClient;
    @Mock
    private PropertyAgentFeignClient propertyAgentFeignClient;
    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks
    private PropertyLeadServiceImpl propertyLeadService;

    @Test
    void createPropertyLead_withMinimalInput_success() {
        PropertyLeadDto inputDto = new PropertyLeadDto(null, "user123", "property456", null, null, null);

        PropertyLead entityFromMapper = PropertyLead.builder()
                .userInfo("user123")
                .propertyInfo("property456")
                .build();

        PropertyLead savedEntity = PropertyLead.builder()
                .id(1)
                .userInfo("user123")
                .propertyInfo("property456")
                .status(LeadStatus.ACTIVE)
                .createDate(today)
                .expiryDate(expiryDate)
                .build();

        PropertyLeadDto expectedDto = new PropertyLeadDto(1, "user123", "property456", LeadStatus.ACTIVE, today, expiryDate);

        when(propertyLeadMapper.toEntity(inputDto)).thenReturn(entityFromMapper);
        when(propertyLeadRepo.save(any(PropertyLead.class))).thenReturn(savedEntity);
        when(propertyLeadProducer.publishLead(any(PropertyLead.class))).thenReturn(true);
        when(propertyLeadMapper.toDto(savedEntity)).thenReturn(expectedDto);

        PropertyLeadDto result = propertyLeadService.createPropertyLead(inputDto);

        assertNotNull(result);
        assertEquals(1, result.id());
        assertEquals("user123", result.userInfo());
        assertEquals("property456", result.propertyInfo());
        assertEquals(LeadStatus.ACTIVE, result.status());
        assertEquals(today, result.createDate());
        assertEquals(expiryDate, result.expiryDate());

        verify(propertyLeadRepo).save(any(PropertyLead.class));
        verify(propertyLeadProducer).publishLead(any(PropertyLead.class));
    }

    @Test
    void createPropertyLead_withFullInput_success() {
        PropertyLeadDto inputDto = new PropertyLeadDto(999, "user123", "property456", LeadStatus.REJECTED, LocalDate.of(2020, 1, 1), LocalDate.of(2020, 2, 1));

        PropertyLead entityFromMapper = PropertyLead.builder()
                .userInfo("user123")
                .propertyInfo("property456")
                .build();

        PropertyLead savedEntity = PropertyLead.builder()
                .id(1)
                .userInfo("user123")
                .propertyInfo("property456")
                .status(LeadStatus.ACTIVE)
                .createDate(today)
                .expiryDate(expiryDate)
                .build();

        PropertyLeadDto expectedDto = new PropertyLeadDto(1, "user123", "property456", LeadStatus.ACTIVE, today, expiryDate);

        when(propertyLeadMapper.toEntity(inputDto)).thenReturn(entityFromMapper);
        when(propertyLeadRepo.save(any(PropertyLead.class))).thenReturn(savedEntity);
        when(propertyLeadProducer.publishLead(any(PropertyLead.class))).thenReturn(true);
        when(propertyLeadMapper.toDto(savedEntity)).thenReturn(expectedDto);

        PropertyLeadDto result = propertyLeadService.createPropertyLead(inputDto);

        assertNotNull(result);
        assertEquals(1, result.id());
        assertEquals(LeadStatus.ACTIVE, result.status());
        assertEquals(today, result.createDate());
        assertEquals(expiryDate, result.expiryDate());
    }

    @Test
    void updatePropertyLead_success() {
        Integer leadId = 1;
        PropertyLeadDto inputDto = new PropertyLeadDto(null, "updatedUser", "updatedProperty", null, null, null);

        PropertyLead existingEntity = PropertyLead.builder()
                .id(1)
                .userInfo("oldUser")
                .propertyInfo("oldProperty")
                .status(LeadStatus.ACTIVE)
                .createDate(today)
                .expiryDate(expiryDate)
                .build();

        PropertyLeadDto expectedDto = new PropertyLeadDto(1, "updatedUser", "updatedProperty", LeadStatus.ACTIVE, today, expiryDate);

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(existingEntity));
        doAnswer(invocation -> {
            PropertyLead entity = invocation.getArgument(0);
            PropertyLeadDto dto = invocation.getArgument(1);
            if (dto.userInfo() != null) entity.setUserInfo(dto.userInfo());
            if (dto.propertyInfo() != null) entity.setPropertyInfo(dto.propertyInfo());
            return null;
        }).when(propertyLeadMapper).updateEntity(any(PropertyLead.class), any(PropertyLeadDto.class));
        when(propertyLeadRepo.save(existingEntity)).thenReturn(existingEntity);
        when(propertyLeadMapper.toDto(existingEntity)).thenReturn(expectedDto);

        PropertyLeadDto result = propertyLeadService.updatePropertyLead(leadId, inputDto);

        assertNotNull(result);
        assertEquals(1, result.id());
        assertEquals("updatedUser", result.userInfo());
        assertEquals("updatedProperty", result.propertyInfo());
        assertEquals(LeadStatus.ACTIVE, result.status());
        assertEquals(today, result.createDate());
        assertEquals(expiryDate, result.expiryDate());
    }

    @Test
    void getPropertyLeadById_success() {
        Integer leadId = 1;
        PropertyLead lead = PropertyLead.builder()
                .id(leadId)
                .userInfo("user")
                .propertyInfo("property")
                .status(LeadStatus.ACTIVE)
                .createDate(today)
                .expiryDate(expiryDate)
                .build();

        PropertyLeadDto expectedDto = new PropertyLeadDto(leadId, "user", "property", LeadStatus.ACTIVE, today, expiryDate);

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));
        when(propertyLeadMapper.toDto(lead)).thenReturn(expectedDto);

        PropertyLeadDto result = propertyLeadService.getPropertyLeadById(leadId);

        assertNotNull(result);
        assertEquals(leadId, result.id());
        assertEquals(LeadStatus.ACTIVE, result.status());
        assertEquals(today, result.createDate());
        assertEquals(expiryDate, result.expiryDate());
    }

    @Test
    void getPropertyLeadById_notFound() {
        when(propertyLeadRepo.findById(1)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> propertyLeadService.getPropertyLeadById(1));
    }

    @Test
    void updateLeadStatus_fromActiveToAccepted_success() {
        Integer leadId = 1;
        PropertyLead lead = PropertyLead.builder()
                .id(leadId)
                .userInfo("user")
                .propertyInfo("property")
                .status(LeadStatus.ACTIVE)
                .createDate(today)
                .expiryDate(expiryDate)
                .build();

        PropertyLeadDto expectedDto = new PropertyLeadDto(leadId, "user", "property", LeadStatus.ACCEPTED, today, expiryDate);

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));
        when(propertyLeadRepo.save(lead)).thenReturn(lead);
        when(propertyLeadMapper.toDto(lead)).thenReturn(expectedDto);

        PropertyLeadDto result = propertyLeadService.updateLeadStatus(leadId, "ACCEPTED");

        assertNotNull(result);
        assertEquals(LeadStatus.ACCEPTED, result.status());
    }

    @Test
    void updateLeadStatus_fromActiveToRejected_success() {
        Integer leadId = 1;
        PropertyLead lead = PropertyLead.builder().id(leadId).status(LeadStatus.ACTIVE).build();

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));
        when(propertyLeadRepo.save(lead)).thenReturn(lead);
        when(propertyLeadMapper.toDto(lead)).thenReturn(new PropertyLeadDto(leadId, "u", "p", LeadStatus.REJECTED, today, expiryDate));

        PropertyLeadDto result = propertyLeadService.updateLeadStatus(leadId, "REJECTED");

        assertEquals(LeadStatus.REJECTED, result.status());
    }

    @Test
    void updateLeadStatus_fromActiveToExpired_success() {
        Integer leadId = 1;
        PropertyLead lead = PropertyLead.builder().id(leadId).status(LeadStatus.ACTIVE).build();

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));
        when(propertyLeadRepo.save(lead)).thenReturn(lead);
        when(propertyLeadMapper.toDto(lead)).thenReturn(new PropertyLeadDto(leadId, "u", "p", LeadStatus.EXPIRED, today, expiryDate));

        PropertyLeadDto result = propertyLeadService.updateLeadStatus(leadId, "EXPIRED");

        assertEquals(LeadStatus.EXPIRED, result.status());
    }

    @Test
    void updateLeadStatus_invalidTransition_fromAcceptedToActive() {
        PropertyLead lead = PropertyLead.builder().id(1).status(LeadStatus.ACCEPTED).build();
        when(propertyLeadRepo.findById(1)).thenReturn(Optional.of(lead));

        assertThrows(IllegalStateException.class, () -> propertyLeadService.updateLeadStatus(1, "ACTIVE"));
    }

    @Test
    void updateLeadStatus_invalidTransition_fromRejectedToAny() {
        PropertyLead lead = PropertyLead.builder().id(1).status(LeadStatus.REJECTED).build();
        when(propertyLeadRepo.findById(1)).thenReturn(Optional.of(lead));

        assertThrows(IllegalStateException.class, () -> propertyLeadService.updateLeadStatus(1, "ACTIVE"));
        assertThrows(IllegalStateException.class, () -> propertyLeadService.updateLeadStatus(1, "ACCEPTED"));
    }

    @Test
    void updateLeadStatus_invalidStatus() {
        assertThrows(IllegalArgumentException.class, () -> propertyLeadService.updateLeadStatus(1, "INVALID_STATUS"));
    }

    @Test
    void findAllPropertyLeads_success() {
        PropertyLead lead = PropertyLead.builder()
                .id(1)
                .status(LeadStatus.ACTIVE)
                .createDate(today)
                .expiryDate(expiryDate)
                .build();

        when(propertyLeadRepo.findByStatus(LeadStatus.ACTIVE)).thenReturn(Collections.singletonList(lead));
        when(propertyLeadMapper.toDto(lead)).thenReturn(new PropertyLeadDto(1, "u", "p", LeadStatus.ACTIVE, today, expiryDate));

        List<PropertyLeadDto> results = propertyLeadService.findAllPropertyLeads();

        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
        assertEquals(LeadStatus.ACTIVE, results.get(0).status());
    }

    @Test
    void findAllPropertyLeads_empty() {
        when(propertyLeadRepo.findByStatus(LeadStatus.ACTIVE)).thenReturn(Collections.emptyList());

        List<PropertyLeadDto> results = propertyLeadService.findAllPropertyLeads();

        assertTrue(results.isEmpty());
    }

    @Test
    void deletePropertyLeadById_success() {
        when(propertyLeadRepo.existsById(1)).thenReturn(true);
        doNothing().when(propertyLeadRepo).deleteById(1);

        assertDoesNotThrow(() -> propertyLeadService.deletePropertyLeadById(1));
        verify(propertyLeadRepo).deleteById(1);
    }

    @Test
    void deletePropertyLeadById_notFound() {
        when(propertyLeadRepo.existsById(1)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> propertyLeadService.deletePropertyLeadById(1));
        verify(propertyLeadRepo, never()).deleteById(1);
    }

    @Test
    void getLeadStats_success() {
        PropertyLead active = PropertyLead.builder().status(LeadStatus.ACTIVE).expiryDate(expiryDate).build();
        PropertyLead accepted = PropertyLead.builder().status(LeadStatus.ACCEPTED).expiryDate(expiryDate).build();
        PropertyLead rejected = PropertyLead.builder().status(LeadStatus.REJECTED).expiryDate(expiryDate).build();
        PropertyLead expired = PropertyLead.builder().status(LeadStatus.EXPIRED).expiryDate(today.minusDays(1)).build();

        when(propertyLeadRepo.findAll()).thenReturn(List.of(active, accepted, rejected, expired));

        LeadStatsDto stats = propertyLeadService.getLeadStats();

        assertEquals(4, stats.totalLeads());
        assertEquals(1, stats.acceptedLeads());
        assertEquals(1, stats.rejectedLeads());
        assertEquals(1, stats.overdueLeads());
    }

}
