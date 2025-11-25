package edu.hcmute.service;

import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.entity.PropertyLeadDetail;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.mapper.PropertyLeadMapper;
import edu.hcmute.repo.PropertyLeadDetailRepo;
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
    private PropertyLeadDetailRepo propertyLeadDetailRepo;
    @Mock
    private PropertyLeadMapper propertyLeadMapper;

    @InjectMocks
    private PropertyLeadServiceImpl propertyLeadService;

    @Test
    void createOrUpdatePropertyLead_create_success() {
        PropertyLeadDto inputDto = new PropertyLeadDto(null, "user1", "prop1", null, null, null);
        PropertyLead entity = new PropertyLead();
        entity.setUserInfo("user1");
        entity.setPropertyInfo("prop1");

        when(propertyLeadMapper.toEntity(inputDto)).thenReturn(entity);
        when(propertyLeadRepo.save(any(PropertyLead.class))).thenAnswer(invocation -> {
            PropertyLead saved = invocation.getArgument(0);
            saved.setId(1);
            return saved;
        });
        when(propertyLeadMapper.toDto(any(PropertyLead.class))).thenReturn(new PropertyLeadDto(1, "user1", "prop1", "ACTIVE", LocalDate.now(), LocalDate.now().plusDays(30)));

        PropertyLeadDto result = propertyLeadService.createOrUpdatePropertyLead(inputDto);

        assertNotNull(result);
        assertEquals(1, result.id());
        verify(propertyLeadRepo).save(any(PropertyLead.class));
    }

    @Test
    void createOrUpdatePropertyLead_update_success() {
        PropertyLeadDto inputDto = new PropertyLeadDto(1, "user1", "prop1", "ACTIVE", null, null);
        PropertyLead existingEntity = new PropertyLead();
        existingEntity.setId(1);

        when(propertyLeadRepo.findById(1)).thenReturn(Optional.of(existingEntity));
        doNothing().when(propertyLeadMapper).updateEntity(existingEntity, inputDto);
        when(propertyLeadRepo.save(existingEntity)).thenReturn(existingEntity);
        when(propertyLeadMapper.toDto(existingEntity)).thenReturn(inputDto);

        PropertyLeadDto result = propertyLeadService.createOrUpdatePropertyLead(inputDto);

        assertNotNull(result);
        assertEquals(1, result.id());
        verify(propertyLeadRepo).findById(1);
        verify(propertyLeadRepo).save(existingEntity);
    }

    @Test
    void createPropertyLeadByQuote_success() {
        Integer quoteId = 100;
        PropertyQuote quote = new PropertyQuote();
        quote.setId(quoteId);
        quote.setUserInfo("user1");
        quote.setPropertyInfo("prop1");

        PropertyLeadDetail detail = new PropertyLeadDetail();
        detail.setPropertyQuote(quote);
        // No existing active lead associated with this detail/quote for this test case

        when(propertyLeadDetailRepo.findByPropertyQuoteId(quoteId)).thenReturn(Collections.singletonList(detail));
        when(propertyLeadRepo.save(any(PropertyLead.class))).thenAnswer(invocation -> {
            PropertyLead saved = invocation.getArgument(0);
            saved.setId(1);
            return saved;
        });
        when(propertyLeadMapper.toDto(any(PropertyLead.class))).thenReturn(new PropertyLeadDto(1, "user1", "prop1", "ACTIVE", null, null));

        PropertyLeadDto result = propertyLeadService.createPropertyLeadByQuote(quoteId);

        assertNotNull(result);
        verify(propertyLeadRepo).save(any(PropertyLead.class));
        verify(propertyLeadDetailRepo).save(any(PropertyLeadDetail.class));
    }

    @Test
    void createPropertyLeadByQuote_alreadyActive() {
        Integer quoteId = 100;
        PropertyQuote quote = new PropertyQuote();
        quote.setId(quoteId);

        PropertyLead activeLead = new PropertyLead();
        activeLead.setId(1);
        activeLead.setStatus("ACTIVE");

        PropertyLeadDetail detail = new PropertyLeadDetail();
        detail.setPropertyQuote(quote);
        detail.setPropertyLead(activeLead);

        when(propertyLeadDetailRepo.findByPropertyQuoteId(quoteId)).thenReturn(Collections.singletonList(detail));

        assertThrows(IllegalStateException.class, () -> propertyLeadService.createPropertyLeadByQuote(quoteId));
    }

    @Test
    void getPropertyLeadById_success() {
        Integer leadId = 1;
        PropertyLead lead = new PropertyLead();
        lead.setId(leadId);

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));
        when(propertyLeadMapper.toDto(lead)).thenReturn(new PropertyLeadDto(leadId, "u", "p", "ACTIVE", null, null));

        PropertyLeadDto result = propertyLeadService.getPropertyLeadById(leadId);

        assertNotNull(result);
        assertEquals(leadId, result.id());
    }

    @Test
    void getPropertyLeadById_notFound() {
        Integer leadId = 1;
        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> propertyLeadService.getPropertyLeadById(leadId));
    }

    @Test
    void updateLeadStatus_success() {
        Integer leadId = 1;
        String newStatus = "ACCEPTED";
        PropertyLead lead = new PropertyLead();
        lead.setId(leadId);
        lead.setStatus("ACTIVE");

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));
        when(propertyLeadRepo.save(lead)).thenReturn(lead);
        when(propertyLeadMapper.toDto(lead)).thenReturn(new PropertyLeadDto(leadId, "u", "p", newStatus, null, null));

        PropertyLeadDto result = propertyLeadService.updateLeadStatus(leadId, newStatus);

        assertNotNull(result);
        assertEquals(newStatus, result.status());
        verify(propertyLeadRepo).save(lead);
    }

    @Test
    void updateLeadStatus_invalidTransition() {
        Integer leadId = 1;
        String newStatus = "ACTIVE";
        PropertyLead lead = new PropertyLead();
        lead.setId(leadId);
        lead.setStatus("ACCEPTED");

        when(propertyLeadRepo.findById(leadId)).thenReturn(Optional.of(lead));

        assertThrows(IllegalStateException.class, () -> propertyLeadService.updateLeadStatus(leadId, newStatus));
    }

    @Test
    void findAllPropertyLeads_success() {
        PropertyLead lead = new PropertyLead();
        lead.setStatus("ACTIVE");
        when(propertyLeadRepo.findAll()).thenReturn(Collections.singletonList(lead));
        when(propertyLeadMapper.toDto(lead)).thenReturn(new PropertyLeadDto(1, "u", "p", "ACTIVE", null, null));

        List<PropertyLeadDto> results = propertyLeadService.findAllPropertyLeads();

        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
    }

    @Test
    void findPropertyLeadsByStatus_success() {
        String status = "ACTIVE";
        PropertyLead lead = new PropertyLead();
        lead.setStatus(status);
        when(propertyLeadRepo.findByStatus(status)).thenReturn(Collections.singletonList(lead));
        when(propertyLeadMapper.toDto(lead)).thenReturn(new PropertyLeadDto(1, "u", "p", status, null, null));

        List<PropertyLeadDto> results = propertyLeadService.findPropertyLeadsByStatus(status);

        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
    }

    @Test
    void deletePropertyLeadById_success() {
        Integer leadId = 1;
        when(propertyLeadRepo.existsById(leadId)).thenReturn(true);
        when(propertyLeadDetailRepo.findAll()).thenReturn(Collections.emptyList());
        when(propertyLeadRepo.findAll()).thenReturn(Collections.emptyList()); // For returning remaining list

        List<PropertyLeadDto> result = propertyLeadService.deletePropertyLeadById(leadId);

        verify(propertyLeadRepo).deleteById(leadId);
        assertNotNull(result);
    }

    @Test
    void getLeadStats_success() {
        PropertyLead active = new PropertyLead();
        active.setStatus("ACTIVE");
        PropertyLead accepted = new PropertyLead();
        accepted.setStatus("ACCEPTED");
        PropertyLead rejected = new PropertyLead();
        rejected.setStatus("REJECTED");
        PropertyLead expired = new PropertyLead();
        expired.setStatus("EXPIRED");

        when(propertyLeadRepo.findAll()).thenReturn(List.of(active, accepted, rejected, expired));

        LeadStatsDto stats = propertyLeadService.getLeadStats();

        assertEquals(4, stats.totalLeads());
        assertEquals(1, stats.acceptedLeads());
        assertEquals(1, stats.rejectedLeads());
        assertEquals(1, stats.overdueLeads());
    }
}