package edu.hcmute.service;

import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.dto.PropertyAddressDto;
import edu.hcmute.dto.PropertyMgmtDto;
import edu.hcmute.entity.AgentLead;
import edu.hcmute.event.NotificationProducer;
import edu.hcmute.mapper.PropertyAgentMapper;
import edu.hcmute.repo.AgentLeadRepo;
import edu.hcmute.repo.UserAddressRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyAgentServiceImplTest {

    @Mock
    private PropertyMgmtFeignClient propertyMgmtFeignClient;
    @Mock
    private PropertyLeadFeignClient propertyLeadFeignClient;
    @Mock
    private NotificationProducer notificationProducer;
    @Mock
    private UserAddressRepo userAddressRepo;
    @Mock
    private AgentLeadRepo agentLeadRepo;
    @Mock
    private PropertyAgentMapper propertyAgentMapper;

    @InjectMocks
    private PropertyAgentServiceImpl propertyAgentService;

    @Test
    void updateLeadAction_create_success() {
        AgentLeadDto inputDto = new AgentLeadDto(0, LeadAction.ACCEPTED, "agent1", 100, null);
        AgentLead entity = new AgentLead();
        entity.setAgentId("agent1");
        entity.setLeadId(100);
        entity.setLeadAction(LeadAction.INTERESTED);
        entity.setCreatedAt(LocalDateTime.now());
        when(propertyAgentMapper.toEntity(inputDto)).thenReturn(entity);
        when(agentLeadRepo.save(any(AgentLead.class))).thenReturn(entity);
        when(propertyAgentMapper.toDto(any(AgentLead.class))).thenReturn(new AgentLeadDto(1, LeadAction.ACCEPTED, "agent1", 100, null));
        AgentLeadDto result = propertyAgentService.updateLeadAction(inputDto);
        assertNotNull(result);
        assertEquals(LeadAction.ACCEPTED, entity.getLeadAction());
        verify(propertyLeadFeignClient, never()).updateLeadStatusById(100, "ACCEPTED");
    }

    @Test
    void updateLeadAction_update_existing_success() {
        AgentLeadDto inputDto = new AgentLeadDto(1, LeadAction.ACCEPTED, "agent1", 100, null);
        AgentLead entity = new AgentLead();
        entity.setId(1);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setLeadAction(LeadAction.INTERESTED);
        when(agentLeadRepo.findById(1)).thenReturn(Optional.of(entity));
        when(agentLeadRepo.save(entity)).thenReturn(entity);
        when(propertyAgentMapper.toDto(entity)).thenReturn(inputDto);
        AgentLeadDto result = propertyAgentService.updateLeadAction(inputDto);
        assertNotNull(result);
        assertEquals(LeadAction.ACCEPTED, entity.getLeadAction());
    }

    @Test
    void updateLeadAction_expired() {
        AgentLeadDto inputDto = new AgentLeadDto(1, LeadAction.ACCEPTED, "agent1", 100, null);
        AgentLead entity = new AgentLead();
        entity.setId(1);
        entity.setCreatedAt(LocalDateTime.now().minusDays(8));
        when(agentLeadRepo.findById(1)).thenReturn(Optional.of(entity));
        assertThrows(IllegalStateException.class, () -> propertyAgentService.updateLeadAction(inputDto));
    }

    @Test
    void updateLeadAction_rejected_allRejected() {
        AgentLeadDto inputDto = new AgentLeadDto(1, LeadAction.REJECTED, "agent1", 100, null);
        AgentLead entity = new AgentLead();
        entity.setId(1);
        entity.setLeadId(100);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setLeadAction(LeadAction.INTERESTED);
        when(agentLeadRepo.findById(1)).thenReturn(Optional.of(entity));
        when(agentLeadRepo.save(entity)).thenReturn(entity);
        when(propertyAgentMapper.toDto(entity)).thenReturn(inputDto);
        AgentLead al1 = new AgentLead();
        al1.setLeadAction(LeadAction.REJECTED);
        when(agentLeadRepo.findByLeadId(100)).thenReturn(Collections.singletonList(al1));
        propertyAgentService.updateLeadAction(inputDto);
        assertEquals(LeadAction.REJECTED, entity.getLeadAction());
        verify(propertyLeadFeignClient).updateLeadStatusById(100, "REJECTED");
    }

    @Test
    void getAgentsByZipCode_success() {
        String zipCode = "12345";
        List<String> expectedAgents = List.of("agent1", "agent2");
        when(userAddressRepo.findUserIdsByZipCode(zipCode)).thenReturn(expectedAgents);
        List<String> result = propertyAgentService.getAgentsByZipCode(zipCode);
        assertEquals(expectedAgents, result);
    }

    @Test
    void getAgentsByZipCode_empty() {
        List<String> result = propertyAgentService.getAgentsByZipCode("");
        assertTrue(result.isEmpty());
    }

    @Test
    void getAgentLeads_success() {
        String agentId = "agent1";
        AgentLead al = new AgentLead();
        when(agentLeadRepo.findByAgentId(agentId)).thenReturn(Collections.singletonList(al));
        when(propertyAgentMapper.toDto(al)).thenReturn(new AgentLeadDto(1, LeadAction.INTERESTED, agentId, 100, null));
        List<AgentLeadDto> result = propertyAgentService.getAgentLeads(agentId);
        assertEquals(1, result.size());
    }

    @Test
    void fetchAgentWithinZipCode_success() {
        String propertyId = "prop1";
        int leadId = 100;
        String zipCode = "12345";
        String agentId = "agent1";
        PropertyAddressDto addressDto = new PropertyAddressDto("12345");
        PropertyMgmtDto propertyDto = new PropertyMgmtDto(addressDto);
        when(propertyMgmtFeignClient.getPropertyInfoById(propertyId)).thenReturn(propertyDto);
        when(userAddressRepo.findUserIdsByZipCode(zipCode)).thenReturn(Collections.singletonList(agentId));
        List<String> result = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);
        verify(notificationProducer).sendNotification(any(NotificationRequestDto.class));
        assertTrue(result.contains(agentId));
    }

    @Test
    void autoRejectExpiredInterests_success() {
        AgentLead expired = new AgentLead();
        expired.setId(1);
        expired.setLeadId(100);
        expired.setLeadAction(LeadAction.INTERESTED);
        when(agentLeadRepo.findByLeadActionAndCreatedAtBefore(eq(LeadAction.INTERESTED), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(expired));
        when(agentLeadRepo.findByLeadId(100)).thenReturn(Collections.singletonList(expired));
        propertyAgentService.autoRejectExpiredInterests();
        assertEquals(LeadAction.REJECTED, expired.getLeadAction());
        verify(agentLeadRepo).save(expired);
        verify(propertyLeadFeignClient).updateLeadStatusById(100, "REJECTED");
    }
}