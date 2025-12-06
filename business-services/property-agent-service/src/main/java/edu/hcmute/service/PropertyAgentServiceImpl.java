package edu.hcmute.service;

import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.config.UserMgmtFeignClient;
import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.*;
import edu.hcmute.entity.AgentLead;
import edu.hcmute.event.NotificationProducer;
import edu.hcmute.mapper.PropertyAgentMapper;
import edu.hcmute.repo.AgentLeadRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final UserMgmtFeignClient userMgmtFeignClient;
    private final PropertyMgmtFeignClient propertyMgmtFeignClient;
    private final PropertyLeadFeignClient propertyLeadFeignClient;
    private final NotificationProducer notificationProducer;
    private final AgentLeadRepo agentLeadRepo;
    private final PropertyAgentMapper propertyAgentMapper;

    @Override
    @Transactional
    public AgentLeadDto updateLeadAction(AgentLeadDto agentLeadDto) {
        log.info("~~> update Lead Action: {}", agentLeadDto);
        AgentLead agentLead = getOrcreateAgentLead(agentLeadDto);
        validateExpiry(agentLead);
        LeadAction newAction = agentLeadDto.leadAction();
        agentLead.setLeadAction(newAction);
        if (agentLead.getId() == 0) {
            agentLead.setId(agentLeadDto.id());
        }
        if (agentLead.getCreatedAt() == null) {
            agentLead.setCreatedAt(LocalDateTime.now());
        }
        agentLeadRepo.save(agentLead);
        handleLeadAction(agentLeadDto, agentLead, newAction);
        return propertyAgentMapper.toDto(agentLead);
    }

    private AgentLead getOrcreateAgentLead(AgentLeadDto agentLeadDto) {
        if (agentLeadDto.id() > 0) {
            return agentLeadRepo.findById(agentLeadDto.id())
                    .orElseGet(() -> propertyAgentMapper.toEntity(agentLeadDto));
        } else {
            return propertyAgentMapper.toEntity(agentLeadDto);
        }
    }

    private void validateExpiry(AgentLead agentLead) {
        if (agentLead.getCreatedAt() != null) {
            LocalDateTime expiry = agentLead.getCreatedAt().plusDays(7);
            if (LocalDateTime.now().isAfter(expiry)) {
                log.warn("~~> action attempted after 7 days expiry. LeadId: {}, AgentId: {}", agentLead.getLeadId(), agentLead.getAgentId());
                throw new IllegalStateException("Lead interaction period has expired (7 days).");
            }
        }
    }

    private void handleLeadAction(AgentLeadDto agentLeadDto, AgentLead agentLead, LeadAction newAction) {
        switch (newAction) {
            case INTERESTED:
                handleInterested(agentLeadDto, agentLead);
                break;
            case ACCEPTED:
                log.info("~~> agent accepted (quoted) lead {}.", agentLead.getLeadId());
                break;
            case REJECTED:
                handleRejected(agentLeadDto, agentLead);
                break;
        }
    }

    private void handleInterested(AgentLeadDto agentLeadDto, AgentLead agentLead) {
        log.info("~~> agent is interested in lead {}.", agentLead.getLeadId());
        try {
            propertyLeadFeignClient.updateLeadStatusById(agentLeadDto.leadId(), "IN_REVIEWING");
            log.info("~~> lead status updated to IN_REVIEWING");
        } catch (Exception e) {
            log.error("~~> failed to update Lead status to IN_REVIEWING in Lead Service", e);
        }
    }

    private void handleRejected(AgentLeadDto agentLeadDto, AgentLead agentLead) {
        List<AgentLead> allAgentsForLead = agentLeadRepo.findByLeadId(agentLead.getLeadId());
        boolean allRejected = allAgentsForLead.stream()
                .allMatch(al -> al.getLeadAction() == LeadAction.REJECTED);
        if (allRejected && !allAgentsForLead.isEmpty()) {
            log.info("~~> all agents rejected lead {}.", agentLead.getLeadId());
            try {
                String updatedLeadAction = propertyLeadFeignClient.updateLeadStatusById(agentLeadDto.leadId(), String.valueOf(LeadAction.REJECTED));
                log.info("~~> lead status updated to REJECTED: {}", updatedLeadAction);
            } catch (Exception e) {
                log.error("~~> failed to update Lead status to REJECTED in Lead Service", e);
            }
        }
    }

    @Override
    public List<String> getAgentsByZipCode(String zipCode) {
        log.info("### Fetching agents by zip code: {} ###", zipCode);
        if (!StringUtils.hasText(zipCode)) {
            return Collections.emptyList();
        }
        // Fetch agents from user-mgmt-service (Keycloak/User source of truth)
        List<UserDto> agents = userMgmtFeignClient.getAgentsByZipCode(zipCode);
        return agents.stream()
                .map(UserDto::id)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgentLeadDto> getAgentLeads(String agentId) {
        log.info("### Fetching agent leads for agent: {} ###", agentId);
        List<AgentLead> agentLeads = agentLeadRepo.findByAgentId(agentId);
        return agentLeads.stream()
                .map(propertyAgentMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public List<String> fetchAgentWithinZipCode(String propertyId, int leadId) {
        try {
            log.info("### Fetching agent within zip code for Property ID: {} ###", propertyId);
            PropertyMgmtDto propertyInfo = propertyMgmtFeignClient.getPropertyInfoById(propertyId);
            if (propertyInfo == null || propertyInfo.propertyAddressDto() == null) {
                log.warn("~~> Property info or address is null for Property ID: {}", propertyId);
                return Collections.emptyList();
            }
            log.info("~~> calling property-info-api to get address-info");
            String zipCode = propertyInfo.propertyAddressDto().zipCode();
            if (StringUtils.hasText(zipCode)) {
                log.info("~~> ZipCode = {}", zipCode);
                // Use the shared method which calls user-mgmt-service
                // Since getAgentsByZipCode is not transactional, we can call it directly.
                // Or if we want to be safe with proxy, we can inject self, but it's not needed here as it just calls Feign.
                List<String> agentIds = getAgentsByZipCode(zipCode);
                log.info("~~> Found {} agents in zipcode {}", agentIds.size(), zipCode);
                for (String agentIdStr : agentIds) {
                    NotificationRequestDto notification = new NotificationRequestDto(
                            agentIdStr,
                            "New Lead Available",
                            "A new lead matches your zip code: " + zipCode + ". Lead ID: " + leadId
                    );
                    notificationProducer.sendNotification(notification);
                    log.info("~~> notification sent to agent: {}", agentIdStr);
                }
                return agentIds;
            } else {
                log.warn("~~> zipCode is null or empty, cannot fetch agents");
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("~~> error fetching agents within zip code", e);
            throw new IllegalStateException(e.getLocalizedMessage());
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
                propertyLeadFeignClient.updateLeadStatusById(leadId, String.valueOf(LeadAction.REJECTED));
            } catch (Exception e) {
                log.error("~~> failed to update Lead status to REJECTED", e);
            }
        }
    }

    @Override
    public AgentDto getAgentById(String agentId) {
        log.info("### Fetching agent by id: {} ###", agentId);
        UserDto userDto = userMgmtFeignClient.getUserById(agentId);
        return propertyAgentMapper.toAgentDto(userDto);
    }
}