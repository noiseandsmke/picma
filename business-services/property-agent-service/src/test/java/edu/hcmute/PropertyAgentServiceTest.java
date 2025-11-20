package edu.hcmute;

import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.entity.AgentLead;
import edu.hcmute.repo.AgentLeadRepo;
import edu.hcmute.service.PropertyAgentServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyAgentServiceTest {
    @InjectMocks
    private PropertyAgentServiceImpl propertyAgentService;
    @Mock
    private PropertyLeadFeignClient propertyLeadFeignClient;
    @Mock
    private AgentLeadRepo agentLeadRepo;
    @Mock
    private ModelMapper modelMapper;

    @Test
    public void testUpdateLeadAction() {
        AgentLeadDto agentLeadDto = new AgentLeadDto();
        agentLeadDto.setLeadId(12);
        agentLeadDto.setLeadAction(LeadAction.ACCEPTED);
        agentLeadDto.setAgentId(103);

        AgentLead agentLead = new AgentLead();
        agentLead.setLeadId(12);
        agentLead.setAgentId(103);
        agentLead.setLeadAction(LeadAction.ACCEPTED);

        when(propertyLeadFeignClient.updateLeadActionById(12, "ACCEPTED")).thenReturn("ACCEPTED");
        when(modelMapper.map(agentLeadDto, AgentLead.class)).thenReturn(agentLead);
        when(agentLeadRepo.save(agentLead)).thenReturn(agentLead);
        when(modelMapper.map(agentLead, AgentLeadDto.class)).thenReturn(agentLeadDto);

        AgentLeadDto result = propertyAgentService.updateLeadAction(agentLeadDto);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(LeadAction.ACCEPTED, result.getLeadAction());
        verify(propertyLeadFeignClient).updateLeadActionById(12, "ACCEPTED");
        verify(agentLeadRepo).save(agentLead);
    }
}