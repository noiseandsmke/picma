package edu.hcmute;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyAgentFeignClient;
import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.mapper.PropertyLeadMapper;
import edu.hcmute.repo.PropertyLeadDetailRepo;
import edu.hcmute.repo.PropertyLeadRepo;
import edu.hcmute.service.PropertyLeadServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PropertyLeadServiceUnitTest {

    @Mock
    private PropertyLeadRepo propertyLeadRepo;
    @Mock
    private PropertyLeadDetailRepo propertyLeadDetailRepo;
    @Mock
    private PropertyMgmtFeignClient propertyMgmtFeignClient;
    @Mock
    private PropertyAgentFeignClient propertyAgentFeignClient;
    @Mock
    private PropertyLeadMapper propertyLeadMapper;

    @InjectMocks
    private PropertyLeadServiceImpl propertyLeadService;

    @BeforeEach
    public void setUp() {
        propertyLeadService = new PropertyLeadServiceImpl(
                propertyLeadRepo,
                propertyLeadDetailRepo,
                propertyMgmtFeignClient,
                propertyAgentFeignClient,
                propertyLeadMapper,
                new ObjectMapper()
        );
    }

    @Test
    public void testFindPropertyLeadsOfAgent() {
        String agentId = "agent-001";
        String agentLeadsJson = """
                [
                    {"leadId": 1, "agentId": "agent-001", "leadAction": "ACCEPTED"},
                    {"leadId": 2, "agentId": "agent-001", "leadAction": "REJECTED"}
                ]
                """;

        when(propertyAgentFeignClient.getAgentLeadsByAgentId(agentId)).thenReturn(agentLeadsJson);

        PropertyLead acceptedLead = new PropertyLead();
        acceptedLead.setId(1);
        acceptedLead.setStatus("ACTIVE");

        PropertyLead activeLead = new PropertyLead();
        activeLead.setId(3);
        activeLead.setStatus("ACTIVE");

        when(propertyLeadRepo.findByStatus("ACTIVE")).thenReturn(List.of(activeLead));
        when(propertyLeadRepo.findAllById(List.of(1))).thenReturn(List.of(acceptedLead));

        when(propertyLeadMapper.toDto(any(PropertyLead.class)))
                .thenAnswer(invocation -> {
                    PropertyLead source = invocation.getArgument(0);
                    return new PropertyLeadDto(
                            source.getId(),
                            null,
                            null,
                            source.getStatus(),
                            null,
                            null
                    );
                });

        List<PropertyLeadDto> result = propertyLeadService.findPropertyLeadsOfAgent(agentId);
        assertEquals(2, result.size());
    }
}