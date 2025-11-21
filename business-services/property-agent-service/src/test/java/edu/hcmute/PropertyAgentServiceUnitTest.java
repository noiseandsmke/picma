package edu.hcmute;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyInfoFeignClient;
import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.repo.AgentLeadRepo;
import edu.hcmute.repo.UserAddressRepo;
import edu.hcmute.service.PropertyAgentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyAgentServiceUnitTest {
    @Mock
    private PropertyInfoFeignClient propertyInfoFeignClient;

    @Mock
    private PropertyLeadFeignClient propertyLeadFeignClient;

    @Mock
    private NotificationFeignClient notificationFeignClient;

    @Mock
    private UserAddressRepo userAddressRepo;

    @Mock
    private AgentLeadRepo agentLeadRepo;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private PropertyAgentServiceImpl propertyAgentService;

    @BeforeEach
    public void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        propertyAgentService = new PropertyAgentServiceImpl(
                propertyInfoFeignClient,
                propertyLeadFeignClient,
                notificationFeignClient,
                userAddressRepo,
                agentLeadRepo,
                objectMapper,
                modelMapper
        );
    }

    @Test
    public void testFetchAgentWithinZipCode_SendsCorrectNotifications() {
        String propertyId = "1";
        int leadId = 100;
        String zipCode = "12345";

        String propertyInfoJson = """
                {
                    "id": 1,
                    "propertyAddressDto": {
                        "zipCode": "12345",
                        "street": "123 Main St",
                        "city": "Test City"
                    }
                }
                """;

        when(propertyInfoFeignClient.getPropertyInfoById(propertyId)).thenReturn(propertyInfoJson);

        List<String> agentIds = Arrays.asList("101", "102", "103");
        when(userAddressRepo.findUserIdsByZipCode(zipCode)).thenReturn(agentIds);

        List<String> result = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);

        assertEquals(3, result.size());

        verify(notificationFeignClient, times(3)).createNotification(any(NotificationRequestDto.class));

        ArgumentCaptor<NotificationRequestDto> notificationCaptor = ArgumentCaptor.forClass(NotificationRequestDto.class);
        verify(notificationFeignClient, times(3)).createNotification(notificationCaptor.capture());

        List<NotificationRequestDto> capturedNotifications = notificationCaptor.getAllValues();

        NotificationRequestDto notification1 = capturedNotifications.get(0);
        assertEquals("101", notification1.getRecipientId());
        assertEquals("New Lead Available", notification1.getTitle());
        assertTrue(notification1.getMessage().contains("12345"));
        assertTrue(notification1.getMessage().contains("Lead ID: 100"));

        NotificationRequestDto notification2 = capturedNotifications.get(1);
        assertEquals("102", notification2.getRecipientId());
        assertEquals("New Lead Available", notification2.getTitle());

        NotificationRequestDto notification3 = capturedNotifications.get(2);
        assertEquals("103", notification3.getRecipientId());
        assertEquals("New Lead Available", notification3.getTitle());

        System.out.println("~~> All 3 notifications verified:");
        capturedNotifications.forEach(n ->
                System.out.println("  - Agent " + n.getRecipientId() + ": " + n.getMessage())
        );
    }

    @Test
    public void testFetchAgentWithinZipCode_HandlesInvalidAgentId() {
        String propertyId = "1";
        int leadId = 100;
        String zipCode = "12345";

        String propertyInfoJson = """
                {
                    "propertyAddressDto": {
                        "zipCode": "12345"
                    }
                }
                """;

        when(propertyInfoFeignClient.getPropertyInfoById(propertyId)).thenReturn(propertyInfoJson);

        List<String> agentIds = Arrays.asList("101", "invalid", "103");
        when(userAddressRepo.findUserIdsByZipCode(zipCode)).thenReturn(agentIds);

        List<String> result = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);

        assertEquals(3, result.size());

        verify(notificationFeignClient, times(3)).createNotification(any(NotificationRequestDto.class));

        System.out.println("~~> Processed all agent IDs including non-numeric");
    }

    @Test
    public void testFetchAgentWithinZipCode_HandlesNotificationFailure() {
        String propertyId = "1";
        int leadId = 100;
        String zipCode = "12345";

        String propertyInfoJson = """
                {
                    "propertyAddressDto": {
                        "zipCode": "12345"
                    }
                }
                """;

        when(propertyInfoFeignClient.getPropertyInfoById(propertyId)).thenReturn(propertyInfoJson);

        List<String> agentIds = Arrays.asList("101", "102");
        when(userAddressRepo.findUserIdsByZipCode(zipCode)).thenReturn(agentIds);

        doThrow(new RuntimeException("Service unavailable"))
                .doNothing()
                .when(notificationFeignClient).createNotification(any(NotificationRequestDto.class));

        List<String> result = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);

        assertEquals(2, result.size());

        verify(notificationFeignClient, times(2)).createNotification(any(NotificationRequestDto.class));

        System.out.println("~~> Continues sending notifications even when one fails");
    }

    @Test
    public void testFetchAgentWithinZipCode_NoZipCode() {
        String propertyId = "1";
        int leadId = 100;

        String propertyInfoJson = """
                {
                    "id": 1,
                    "propertyAddressDto": {}
                }
                """;

        when(propertyInfoFeignClient.getPropertyInfoById(propertyId)).thenReturn(propertyInfoJson);

        List<String> result = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);

        assertTrue(result.isEmpty());
        verify(notificationFeignClient, never()).createNotification(any());

        System.out.println("~~> No notifications sent when zipCode is missing");
    }

    @Test
    public void testFetchAgentWithinZipCode_NoAgentsFound() {
        String propertyId = "1";
        int leadId = 100;
        String zipCode = "99999";

        String propertyInfoJson = """
                {
                    "propertyAddressDto": {
                        "zipCode": "99999"
                    }
                }
                """;

        when(propertyInfoFeignClient.getPropertyInfoById(propertyId)).thenReturn(propertyInfoJson);
        when(userAddressRepo.findUserIdsByZipCode(zipCode)).thenReturn(List.of());

        List<String> result = propertyAgentService.fetchAgentWithinZipCode(propertyId, leadId);

        assertTrue(result.isEmpty());
        verify(notificationFeignClient, never()).createNotification(any());

        System.out.println("~~> No notifications sent when no agents found");
    }
}