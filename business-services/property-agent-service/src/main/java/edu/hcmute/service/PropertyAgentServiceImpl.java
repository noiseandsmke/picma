package edu.hcmute.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyInfoFeignClient;
import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.entity.AgentLead;
import edu.hcmute.event.NotificationProducer;
import edu.hcmute.repo.AgentLeadRepo;
import edu.hcmute.repo.UserAddressRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyAgentServiceImpl implements PropertyAgentService {
    private final PropertyInfoFeignClient propertyInfoFeignClient;
    private final PropertyLeadFeignClient propertyLeadFeignClient;
    private final NotificationProducer notificationProducer;
    private final UserAddressRepo userAddressRepo;
    private final AgentLeadRepo agentLeadRepo;
    private final ObjectMapper objectMapper;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public AgentLeadDto updateLeadAction(AgentLeadDto agentLeadDto) {
        log.info("~~> update Lead Action: {}", agentLeadDto);
        AgentLead agentLead;
        if (agentLeadDto.getId() > 0) {
            agentLead = agentLeadRepo.findById(agentLeadDto.getId())
                    .orElse(modelMapper.map(agentLeadDto, AgentLead.class));
        } else {
            agentLead = modelMapper.map(agentLeadDto, AgentLead.class);
        }
        if (agentLead.getCreatedAt() != null) {
            LocalDateTime expiry = agentLead.getCreatedAt().plusDays(7);
            if (LocalDateTime.now().isAfter(expiry)) {
                log.warn("~~> action attempted after 7 days expiry. LeadId: {}, AgentId: {}", agentLead.getLeadId(), agentLead.getAgentId());
                throw new IllegalStateException("Lead interaction period has expired (7 days).");
            }
        }

        LeadAction newAction = agentLeadDto.getLeadAction();
        agentLead.setLeadAction(newAction);
        if (agentLead.getId() == 0) {
            agentLead.setId(agentLeadDto.getId());
        }
        agentLeadRepo.save(agentLead);
        if (newAction.equals(LeadAction.ACCEPTED)) {
            log.info("~~> agent accepted lead {}.", agentLead.getLeadId());
            try {
                String updatedLeadAction = propertyLeadFeignClient.updateLeadActionById(agentLeadDto.getLeadId(), String.valueOf(LeadAction.ACCEPTED));
                log.info("~~> lead status updated to ACCEPTED: {}", updatedLeadAction);
            } catch (Exception e) {
                log.error("~~> failed to update Lead status to ACCEPTED in Lead Service", e);
            }
        } else if (newAction.equals(LeadAction.REJECTED)) {
            List<AgentLead> allAgentsForLead = agentLeadRepo.findByLeadId(agentLead.getLeadId());
            boolean allRejected = allAgentsForLead.stream()
                    .allMatch(al -> al.getLeadAction() == LeadAction.REJECTED);

            if (allRejected && !allAgentsForLead.isEmpty()) {
                log.info("~~> all agents rejected lead {}.", agentLead.getLeadId());
                try {
                    String updatedLeadAction = propertyLeadFeignClient.updateLeadActionById(agentLeadDto.getLeadId(), String.valueOf(LeadAction.REJECTED));
                    log.info("~~> lead status updated to REJECTED: {}", updatedLeadAction);
                } catch (Exception e) {
                    log.error("~~> failed to update Lead status to REJECTED in Lead Service", e);
                }
            }
        }
        return modelMapper.map(agentLead, AgentLeadDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAgentsByZipCode(String zipCode) {
        log.info("### Fetching agents by zip code: {} ###", zipCode);
        if (!StringUtils.hasText(zipCode)) {
            return Collections.emptyList();
        }
        return userAddressRepo.findUserIdsByZipCode(zipCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgentLeadDto> getAgentLeads(String agentId) {
        log.info("### Fetching agent leads for agent: {} ###", agentId);
        List<AgentLead> agentLeads = agentLeadRepo.findByAgentId(agentId);
        return agentLeads.stream()
                .map(lead -> modelMapper.map(lead, AgentLeadDto.class))
                .toList();
    }

    @Override
    @Transactional
    public List<String> fetchAgentWithinZipCode(String propertyId, int leadId) {
        try {
            log.info("### Fetching agent within zip code: {} ###", propertyId);
            String propertyInfo = propertyInfoFeignClient.getPropertyInfoById(propertyId);
            JsonNode jsonObj = objectMapper.readTree(propertyInfo);
            log.info("~~> calling property-info-api to get address-info");

            String zipCode = extractZipCode(jsonObj);

            if (StringUtils.hasText(zipCode)) {
                List<String> agentIds = userAddressRepo.findUserIdsByZipCode(zipCode);
                log.info("~~> ZipCode = {}", zipCode);
                log.info("~~> agentIds = {}", agentIds);
                for (String agentIdStr : agentIds) {
                    try {
                        AgentLead agentLead = new AgentLead();
                        agentLead.setAgentId(agentIdStr);
                        agentLead.setLeadId(leadId);
                        agentLead.setLeadAction(LeadAction.INTERESTED);
                        agentLead.setCreatedAt(LocalDateTime.now());
                        agentLeadRepo.save(agentLead);
                        NotificationRequestDto notification = NotificationRequestDto.builder()
                                .recipientId(agentIdStr)
                                .title("New Lead Available")
                                .message("A new lead matches your zip code: " + zipCode + ". Lead ID: " + leadId)
                                .build();
                        notificationProducer.sendNotification(notification);
                        log.info("~~> notification sent to agent: {}", agentIdStr);
                    } catch (Exception e) {
                        log.error("~~> failed to send notification to agent: {}", agentIdStr, e);
                    }
                }
                return agentIds;
            } else {
                log.warn("~~> zipCode is null or empty, cannot fetch agents");
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("~~> error fetching agents within zip code", e);
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoRejectExpiredInterests() {
        log.info("~~> running autoRejectExpiredInterests...");
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<AgentLead> expiredLeads = agentLeadRepo.findByLeadActionAndCreatedAtBefore(LeadAction.INTERESTED, sevenDaysAgo);
        for (AgentLead lead : expiredLeads) {
            log.info("~~> auto-rejecting expired interest for Lead {} Agent {}", lead.getLeadId(), lead.getAgentId());
            lead.setLeadAction(LeadAction.REJECTED);
            agentLeadRepo.save(lead);
            checkGlobalReject(lead.getLeadId());
        }
    }

    private void checkGlobalReject(int leadId) {
        List<AgentLead> allAgentsForLead = agentLeadRepo.findByLeadId(leadId);
        boolean allRejected = allAgentsForLead.stream()
                .allMatch(al -> al.getLeadAction() == LeadAction.REJECTED);
        if (allRejected && !allAgentsForLead.isEmpty()) {
            try {
                propertyLeadFeignClient.updateLeadActionById(leadId, String.valueOf(LeadAction.REJECTED));
            } catch (Exception e) {
                log.error("~~> failed to update Lead status to REJECTED", e);
            }
        }
    }

    private String extractZipCode(JsonNode jsonObj) {
        if (jsonObj.has("propertyAddressDto")) {
            JsonNode addressObj = jsonObj.get("propertyAddressDto");
            if (addressObj.has("zipCode")) {
                return addressObj.get("zipCode").asText();
            }
        }
        log.warn("~~> propertyAddressDto or zipCode field not found in property info response");
        return null;
    }
}