package edu.hcmute.service;

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

    @Mock
    private PropertyLeadRepo propertyLeadRepo;
    @Mock
    private PropertyLeadMapper propertyLeadMapper;
    @Mock
    private PropertyLeadProducer propertyLeadProducer;

    @InjectMocks
    private PropertyLeadServiceImpl propertyLeadService;

    @Test
    void createPropertyLead_success() {
        PropertyLeadDto inputDto = new PropertyLeadDto(null, "user1", "prop1", null, null, null);
        PropertyLead entity = PropertyLead.builder()
                .userInfo("user1")
                .propertyInfo("prop1")
                .status(LeadStatus.ACTIVE)
                .build();

        when(propertyLeadMapper.toEntity(inputDto)).thenReturn(entity);
        when(propertyLeadRepo.save(any(PropertyLead.class))).thenAnswer(invocation -> {
            PropertyLead saved = invocation.getArgument(0);
            saved.setId(1);
            return saved;
        });
        when(propertyLeadProducer.publishLead(any(PropertyLead.class))).thenReturn(true);
        when(propertyLeadMapper.toDto(any(PropertyLead.class)))
                .thenReturn(new PropertyLeadDto(1, "user1", "prop1", LeadStatus.ACTIVE, LocalDate.now(), LocalDate.now().plusDays(30)));

        PropertyLeadDto result = propertyLeadService.createPropertyLead(inputDto);

        assertNotNull(result);
        assertEquals(1, result.id());
        verify(propertyLeadRepo).save(any(PropertyLead.class));
        verify(propertyLeadProducer).publishLead(any(PropertyLead.class));
    }

    @Test
    void updatePropertyLead_success() {
        Integer leadId = 1;
        PropertyLeadDto inputDto = new PropertyLeadDto(1, "user1", "prop1", LeadStatus.ACTIVE, null, null);
        PropertyLead existingEntity = PropertyLead.builder()
                .id(1)
                .userInfo("user1")
                .propertyInfo("prop1")
                .status(LeadStatus.ACTIVE)
                .build();

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(existingEntity));
        doNothing().when(propertyLeadMapper).updateEntity(existingEntity, inputDto);
        when(propertyLeadRepo.save(existingEntity)).thenReturn(existingEntity);
        when(propertyLeadMapper.toDto(existingEntity)).thenReturn(inputDto);

        PropertyLeadDto result = propertyLeadService.updatePropertyLead(leadId, inputDto);

        assertNotNull(result);
        assertEquals(1, result.id());
        verify(propertyLeadRepo).findById(leadId);
        verify(propertyLeadRepo).save(existingEntity);
    }

    @Test
    void getPropertyLeadById_success() {
        Integer leadId = 1;
        PropertyLead lead = PropertyLead.builder()
                .id(leadId)
                .userInfo("u")
                .propertyInfo("p")
                .status(LeadStatus.ACTIVE)
                .build();

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));
        when(propertyLeadMapper.toDto(lead))
                .thenReturn(new PropertyLeadDto(leadId, "u", "p", LeadStatus.ACTIVE, null, null));

        PropertyLeadDto result = propertyLeadService.getPropertyLeadById(leadId);

        assertNotNull(result);
        assertEquals(leadId, result.id());
    }

    @Test
    void getPropertyLeadById_notFound() {
        when(propertyLeadRepo.findById(1)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> propertyLeadService.getPropertyLeadById(1));
    }

    @Test
    void updateLeadStatus_success() {
        Integer leadId = 1;
        PropertyLead lead = PropertyLead.builder().id(leadId).status(LeadStatus.ACTIVE).build();

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));
        when(propertyLeadRepo.save(lead)).thenReturn(lead);
        when(propertyLeadMapper.toDto(lead))
                .thenReturn(new PropertyLeadDto(leadId, "u", "p", LeadStatus.ACCEPTED, null, null));

        PropertyLeadDto result = propertyLeadService.updateLeadStatus(leadId, "ACCEPTED");

        assertNotNull(result);
        assertEquals(LeadStatus.ACCEPTED, result.status());
    }

    @Test
    void updateLeadStatus_invalidTransition() {
        PropertyLead lead = PropertyLead.builder().id(1).status(LeadStatus.ACCEPTED).build();
        when(propertyLeadRepo.findById(1)).thenReturn(Optional.of(lead));
        assertThrows(IllegalStateException.class, () -> propertyLeadService.updateLeadStatus(1, "ACTIVE"));
    }

    @Test
    void findAllPropertyLeads_success() {
        PropertyLead lead = PropertyLead.builder().id(1).status(LeadStatus.ACTIVE).build();
        when(propertyLeadRepo.findByStatus(LeadStatus.ACTIVE)).thenReturn(Collections.singletonList(lead));
        when(propertyLeadMapper.toDto(lead))
                .thenReturn(new PropertyLeadDto(1, "u", "p", LeadStatus.ACTIVE, null, null));

        List<PropertyLeadDto> results = propertyLeadService.findAllPropertyLeads();

        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
    }

    @Test
    void deletePropertyLeadById_success() {
        when(propertyLeadRepo.existsById(1)).thenReturn(true);
        doNothing().when(propertyLeadRepo).deleteById(1);

        assertDoesNotThrow(() -> propertyLeadService.deletePropertyLeadById(1));
        verify(propertyLeadRepo).deleteById(1);
    }

    @Test
    void getLeadStats_success() {
        PropertyLead active = PropertyLead.builder().status(LeadStatus.ACTIVE).build();
        PropertyLead accepted = PropertyLead.builder().status(LeadStatus.ACCEPTED).build();
        PropertyLead rejected = PropertyLead.builder().status(LeadStatus.REJECTED).build();
        PropertyLead expired = PropertyLead.builder().status(LeadStatus.EXPIRED).build();

        when(propertyLeadRepo.findAll()).thenReturn(List.of(active, accepted, rejected, expired));

        LeadStatsDto stats = propertyLeadService.getLeadStats();

        assertEquals(4, stats.totalLeads());
        assertEquals(1, stats.acceptedLeads());
        assertEquals(1, stats.rejectedLeads());
        assertEquals(1, stats.overdueLeads());
    }
}
