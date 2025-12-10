package edu.hcmute.controller;

import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.service.PropertyAgentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyAgentControllerTest {

    @Mock
    private PropertyAgentService propertyAgentService;

    @InjectMocks
    private PropertyAgentController propertyAgentController;

    @Test
    void updateLeadAction_shouldReturnUpdatedAgentLead() {
        AgentLeadDto inputDto = new AgentLeadDto(1, LeadAction.INTERESTED, "agent1", 100, null, null, null);
        AgentLeadDto returnedDto = new AgentLeadDto(1, LeadAction.INTERESTED, "agent1", 100, null, null, null);
        when(propertyAgentService.updateLeadActionByAgent(any(AgentLeadDto.class))).thenReturn(returnedDto);
        ResponseEntity<AgentLeadDto> response = propertyAgentController.updateLeadAction(inputDto);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(returnedDto, response.getBody());
        verify(propertyAgentService).updateLeadActionByAgent(inputDto);
    }

    @Test
    void getAgentsByZipCode_shouldReturnListOfAgentIds() {
        String zipCode = "12345";
        List<String> agentIds = List.of("agent1", "agent2");
        when(propertyAgentService.getAgentsByZipCode(zipCode)).thenReturn(agentIds);
        ResponseEntity<List<String>> response = propertyAgentController.getAgentsByZipCode(zipCode);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(agentIds, response.getBody());
        verify(propertyAgentService).getAgentsByZipCode(zipCode);
    }

    @Test
    void getAgentLeads_shouldReturnListOfAgentLeads() {
        String agentId = "agent1";
        AgentLeadDto leadDto = new AgentLeadDto(1, LeadAction.INTERESTED, agentId, 100, null, null, null);
        List<AgentLeadDto> leads = Collections.singletonList(leadDto);
        when(propertyAgentService.getAgentLeads(agentId)).thenReturn(leads);
        ResponseEntity<List<AgentLeadDto>> response = propertyAgentController.getAgentLeads(agentId);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(leads, response.getBody());
        verify(propertyAgentService).getAgentLeads(agentId);
    }
}