package edu.hcmute;

import edu.hcmute.config.NotificationFeignClient;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.service.PropertyAgentService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

@SpringBootTest
public class NotificationIntegrationTest extends PropertyAgentServiceApplicationTests {
    @Autowired
    private PropertyAgentService propertyAgentService;

    @Autowired
    private NotificationFeignClient notificationFeignClient;

    @Disabled("Enable when notification-service is running")
    @Test
    public void testCreateNotificationViaFeignClient() {
        NotificationRequestDto notification = NotificationRequestDto.builder()
                .recipientId(103)
                .title("Test Notification")
                .message("This is a test notification from integration test")
                .build();
        try {
            notificationFeignClient.createNotification(notification);
            System.out.println("Notification sent successfully to agent: 103");
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
            Assertions.fail("Should be able to send notification when service is running");
        }
    }

    @Disabled("Enable when notification-service is running")
    @Test
    public void testSendNotificationToMultipleAgents() {
        List<Integer> agentIds = List.of(101, 102, 103);
        String zipCode = "12345";
        int leadId = 20;
        int successCount = 0;
        int failCount = 0;
        for (Integer agentId : agentIds) {
            try {
                NotificationRequestDto notification = NotificationRequestDto.builder()
                        .recipientId(agentId)
                        .title("New Lead Available")
                        .message("A new lead matches your zip code: " + zipCode + ". Lead ID: " + leadId)
                        .build();
                notificationFeignClient.createNotification(notification);
                successCount++;
                System.out.println("Successfully sent notification to agent: " + agentId);
            } catch (Exception e) {
                failCount++;
                System.err.println("Failed to send notification to agent: " + agentId + " - " + e.getMessage());
            }
        }
        System.out.println("Notification Results: Success=" + successCount + ", Failed=" + failCount);
        Assertions.assertEquals(agentIds.size(), successCount, "All notifications should be sent successfully");
        Assertions.assertEquals(0, failCount, "No notifications should fail");
    }

    @Disabled("Enable when all services are running and test data is available")
    @Test
    public void testCompleteNotificationFlow() {
        String propertyId = "1";
        int leadId = 25;
        List<String> notifiedAgents = new ArrayList<>();
        try {
            notifiedAgents = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);
        } catch (Exception e) {
            System.err.println("Error in fetchAgentWithinZipCode: " + e.getMessage());
            Assertions.fail("Should be able to fetch agents when services are running");
        }
        Assertions.assertNotNull(notifiedAgents, "Notified agents list should not be null");
        System.out.println("Total agents notified: " + notifiedAgents.size());

        if (!notifiedAgents.isEmpty()) {
            System.out.println("Agents who received notifications: " + notifiedAgents);
            for (String agentId : notifiedAgents) {
                Assertions.assertNotNull(agentId);
                Assertions.assertFalse(agentId.isEmpty());
                System.out.println("Verified notification sent to agent ID: " + agentId);
            }
        }
    }
}