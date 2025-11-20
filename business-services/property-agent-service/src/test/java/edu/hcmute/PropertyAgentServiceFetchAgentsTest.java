package edu.hcmute;

import edu.hcmute.service.PropertyAgentService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public class PropertyAgentServiceFetchAgentsTest extends PropertyAgentServiceApplicationTests {
    @Autowired
    private PropertyAgentService propertyAgentService;

    @Disabled("Enable this test when all microservices are running")
    @Test
    public void testFetchAgentWithinZipCodeAndSendNotifications() {
        String propertyId = "1";
        int leadId = 12;
        List<String> agentIds = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);
        Assertions.assertNotNull(agentIds, "Agent IDs list should not be null");
        Assertions.assertNotNull(agentIds);
        if (!agentIds.isEmpty()) {
            System.out.println("Found " + agentIds.size() + " agents for property " + propertyId);
            System.out.println("Agent IDs: " + agentIds);
            Assertions.assertFalse(agentIds.isEmpty());
        } else {
            System.out.println("No agents found for property " + propertyId);
        }
    }

    @Disabled("Enable this test with valid test data")
    @Test
    public void testFetchAgentWithinZipCodeWithKnownData() {
        String propertyId = "1";
        int leadId = 15;
        List<String> agentIds = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);
        Assertions.assertNotNull(agentIds);
        Assertions.assertFalse(agentIds.isEmpty(), "Should find at least one agent");
        for (String agentId : agentIds) {
            Assertions.assertNotNull(agentId);
            Assertions.assertFalse(agentId.isEmpty());
        }
    }
}