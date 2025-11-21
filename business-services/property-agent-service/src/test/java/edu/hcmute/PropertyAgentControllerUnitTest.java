package edu.hcmute;

import edu.hcmute.controller.PropertyAgentController;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.service.PropertyAgentService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyAgentControllerUnitTest {

    @Mock
    private PropertyAgentService propertyAgentService;

    @InjectMocks
    private PropertyAgentController propertyAgentController;

    @Test
    public void testGetAgentLeads() {
        String agentId = "agent-001";
        AgentLeadDto lead = new AgentLeadDto();
        lead.setAgentId(agentId);
        lead.setLeadId(100);

        when(propertyAgentService.getAgentLeads(agentId)).thenReturn(List.of(lead));

        ResponseEntity<List<AgentLeadDto>> response = propertyAgentController.getAgentLeads(agentId);

        assertEquals(200, response.getStatusCode().value());
        Assertions.assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(agentId, response.getBody().get(0).getAgentId());
    }

    @Test
    public void testGetAgentLeads_Empty() {
        String agentId = "unknown";
        when(propertyAgentService.getAgentLeads(agentId)).thenReturn(Collections.emptyList());

        ResponseEntity<List<AgentLeadDto>> response = propertyAgentController.getAgentLeads(agentId);

        assertEquals(200, response.getStatusCode().value());
        Assertions.assertNotNull(response.getBody());
        assertEquals(0, response.getBody().size());
    }
}