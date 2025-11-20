package edu.hcmute.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyInfoFeignClient;
import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.entity.AgentLead;
import edu.hcmute.repo.AgentLeadRepo;
import edu.hcmute.repo.UserAddressRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyAgentServiceImpl implements PropertyAgentService {
    private final PropertyInfoFeignClient propertyInfoFeignClient;
    private final PropertyLeadFeignClient propertyLeadFeignClient;
    private final UserAddressRepo userAddressRepo;
    private final AgentLeadRepo agentLeadRepo;
    private final ObjectMapper objectMapper;
    private final ModelMapper modelMapper;

    @Override
    public AgentLeadDto updateLeadAction(AgentLeadDto agentLeadDto) {
        log.info("AgentLeadDto: {}", agentLeadDto.toString());
        LeadAction action = agentLeadDto.getLeadAction();
        if (action.equals(LeadAction.ACCEPTED)) {
            String updatedLeadAction = propertyLeadFeignClient.updateLeadActionById(agentLeadDto.getLeadId(), String.valueOf(agentLeadDto.getLeadAction()));
            log.info("~~> leadAction updated: {}", updatedLeadAction);
        }
        AgentLead agentLead = modelMapper.map(agentLeadDto, AgentLead.class);
        agentLeadRepo.save(agentLead);
        return modelMapper.map(agentLead, AgentLeadDto.class);
    }

    @Override
    public List<String> fetchAgentWithinZipCode(String propertyId, int leadId) {
        try {
            log.info("### Fetching agent within zip code: {} ###", propertyId);
            String propertyInfo = propertyInfoFeignClient.getPropertyInfoById(propertyId);
            JsonNode jsonObj = objectMapper.readTree(propertyInfo);
            log.info("~~> calling property-info-api to get address-info");
            log.info("~~> Property JSON response: {}", propertyInfo);

            String zipCode = extractZipCode(jsonObj);

            if (StringUtils.hasText(zipCode)) {
                List<String> agentIds = userAddressRepo.findUserIdsByZipCode(zipCode);
                log.info("ZipCode = {}", zipCode);
                log.info("### agentIds = {}", agentIds);
                // TODO: send notification to all agents with lead information
                return agentIds;
            } else {
                log.warn("zipCode is null or empty, cannot fetch agents");
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error fetching agents within zip code", e);
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    private String extractZipCode(JsonNode jsonObj) {
        if (jsonObj.has("propertyAddressDto")) {
            JsonNode addressObj = jsonObj.get("propertyAddressDto");
            if (addressObj.has("zipCode")) {
                return addressObj.get("zipCode").asText();
            }
        }
        log.warn("propertyAddressDto or zipCode field not found in property info response");
        return null;
    }
}