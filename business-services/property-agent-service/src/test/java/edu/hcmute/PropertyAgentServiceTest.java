package edu.hcmute;

import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.service.PropertyAgentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class PropertyAgentServiceTest extends PropertyAgentServiceApplicationTests {
    @Autowired
    private PropertyAgentService propertyAgentService;

    @Test
    public void testUpdateLeadAction() {
        AgentLeadDto agentLeadDto = new AgentLeadDto();
        agentLeadDto.setLeadId(12);
        agentLeadDto.setLeadAction(LeadAction.ACCEPTED);
        agentLeadDto.setAgentId(103);
        propertyAgentService.updateLeadAction(agentLeadDto);
    }
}