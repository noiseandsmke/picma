package edu.hcmute.service;

import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.config.UserMgmtFeignClient;
import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadActionDto;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.dto.PropertyAgentDto;
import edu.hcmute.dto.PropertyMgmtDto;
import edu.hcmute.entity.AgentLeadAction;
import edu.hcmute.event.NotificationProducer;
import edu.hcmute.mapper.PropertyAgentMapper;
import edu.hcmute.repo.AgentLeadActionRepo;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyAgentServiceImplTest {

    @Mock
    private PropertyMgmtFeignClient propertyMgmtFeignClient;
    @Mock
    private PropertyLeadFeignClient propertyLeadFeignClient;
    @Mock
    private UserMgmtFeignClient userMgmtFeignClient;
    @Mock
    private NotificationProducer notificationProducer;
    @Mock
    private AgentLeadActionRepo agentLeadActionRepo;
    @Mock
    private PropertyAgentMapper propertyAgentMapper;

    @InjectMocks
    private PropertyAgentServiceImpl propertyAgentService;

    @Test
    void updateLeadAction_create_success() {
        AgentLeadActionDto inputDto = new AgentLeadActionDto(0, LeadAction.INTERESTED, "agent1", 100, null);
        AgentLeadAction entity = new AgentLeadAction();
        entity.setAgentId("agent1");
        entity.setLeadId(100);
        entity.setLeadAction(null);
        entity.setCreatedAt(LocalDateTime.now());
        when(propertyAgentMapper.toEntity(inputDto)).thenReturn(entity);
        when(agentLeadActionRepo.save(any(AgentLeadAction.class))).thenReturn(entity);
        AgentLeadActionDto result = propertyAgentService.updateLeadActionByAgent(inputDto);
        assertNotNull(result);
        assertEquals(LeadAction.INTERESTED, entity.getLeadAction());
    }

    @Test
    void updateLeadAction_update_existing_success() {
        AgentLeadActionDto inputDto = new AgentLeadActionDto(1, LeadAction.ACCEPTED, "agent1", 100, null);
        AgentLeadAction entity = new AgentLeadAction();
        entity.setId(1);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setLeadId(100);
        entity.setLeadAction(LeadAction.INTERESTED);
        when(agentLeadActionRepo.findById(1)).thenReturn(Optional.of(entity));
        when(agentLeadActionRepo.save(entity)).thenReturn(entity);
        AgentLeadActionDto result = propertyAgentService.updateLeadActionBySystem(inputDto);
        assertNotNull(result);
        assertEquals(LeadAction.ACCEPTED, entity.getLeadAction());
    }

    @Test
    void updateLeadAction_manual_accepted_fails() {
        AgentLeadActionDto inputDto = new AgentLeadActionDto(1, LeadAction.ACCEPTED, "agent1", 100, null);
        assertThrows(IllegalArgumentException.class, () -> propertyAgentService.updateLeadActionByAgent(inputDto));
    }

    @Test
    void updateLeadAction_expired() {
        AgentLeadActionDto inputDto = new AgentLeadActionDto(1, LeadAction.REJECTED, "agent1", 100, null);
        AgentLeadAction entity = new AgentLeadAction();
        entity.setId(1);
        entity.setLeadId(100);
        entity.setLeadAction(LeadAction.INTERESTED);
        entity.setCreatedAt(LocalDateTime.now().minusDays(8));
        when(agentLeadActionRepo.findById(1)).thenReturn(Optional.of(entity));
        assertThrows(IllegalStateException.class, () -> propertyAgentService.updateLeadActionByAgent(inputDto));
    }

    @Test
    void updateLeadAction_rejected_allRejected() {
        AgentLeadActionDto inputDto = new AgentLeadActionDto(1, LeadAction.REJECTED, "agent1", 100, null);
        AgentLeadAction entity = new AgentLeadAction();
        entity.setId(1);
        entity.setLeadId(100);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setLeadAction(LeadAction.INTERESTED);
        when(agentLeadActionRepo.findById(1)).thenReturn(Optional.of(entity));
        when(agentLeadActionRepo.save(entity)).thenReturn(entity);
        AgentLeadAction al1 = new AgentLeadAction();
        al1.setLeadAction(LeadAction.REJECTED);
        when(agentLeadActionRepo.findByLeadId(100)).thenReturn(Collections.singletonList(al1));
        propertyAgentService.updateLeadActionByAgent(inputDto);
        assertEquals(LeadAction.REJECTED, entity.getLeadAction());
        verify(propertyLeadFeignClient).updateLeadStatusById(100, "REJECTED");
    }

    @Test
    void getAgentsByZipCode_success() {
        String zipCode = "12345";
        List<String> expectedAgentIds = List.of("agent1", "agent2");
        List<PropertyAgentDto> agentDtos = List.of(
                new PropertyAgentDto("agent1", "Agent One", "agent1@example.com", zipCode),
                new PropertyAgentDto("agent2", "Agent Two", "agent2@example.com", zipCode)
        );
        when(userMgmtFeignClient.getAgentsByZipCode(zipCode)).thenReturn(agentDtos);
        List<String> result = propertyAgentService.getAgentsByZipCode(zipCode);
        assertEquals(expectedAgentIds, result);
    }

    @Test
    void getAgentsByZipCode_empty() {
        List<String> result = propertyAgentService.getAgentsByZipCode("");
        assertTrue(result.isEmpty());
    }

    @Test
    void getAgentLeads_success() {
        String agentId = "agent1";
        AgentLeadAction al = new AgentLeadAction();
        al.setLeadId(100);
        when(agentLeadActionRepo.findByAgentId(agentId)).thenReturn(Collections.singletonList(al));
        List<AgentLeadActionDto> result = propertyAgentService.getAgentLeads(agentId);
        assertEquals(1, result.size());
    }

    @Test
    void fetchAgentWithinZipCode_success() {
        String propertyId = "prop1";
        int leadId = 100;
        String zipCode = "12345";
        String agentId = "agent1";
        PropertyMgmtDto.LocationDto location = new PropertyMgmtDto.LocationDto("12345");
        PropertyMgmtDto propertyDto = new PropertyMgmtDto(propertyId, location);
        PropertyAgentDto agentDto = new PropertyAgentDto(agentId, "Agent One", "agent1@example.com", zipCode);
        when(propertyMgmtFeignClient.fetchAllPropertiesByZipCode("")).thenReturn(List.of(propertyDto));
        when(userMgmtFeignClient.getAgentsByZipCode(zipCode)).thenReturn(Collections.singletonList(agentDto));
        List<String> result = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);
        verify(notificationProducer).sendNotification(any(NotificationRequestDto.class));
        assertTrue(result.contains(agentId));
    }

    @Test
    void autoRejectExpiredInterests_success() {
        AgentLeadAction expired = new AgentLeadAction();
        expired.setId(1);
        expired.setLeadId(100);
        expired.setLeadAction(LeadAction.INTERESTED);
        when(agentLeadActionRepo.findByLeadActionAndCreatedAtBefore(eq(LeadAction.INTERESTED), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(expired));
        when(agentLeadActionRepo.findByLeadId(100)).thenReturn(Collections.singletonList(expired));
        propertyAgentService.autoRejectExpiredInterests();
        assertEquals(LeadAction.REJECTED, expired.getLeadAction());
        verify(agentLeadActionRepo).save(expired);
        verify(propertyLeadFeignClient).updateLeadStatusById(100, "REJECTED");
    }
}