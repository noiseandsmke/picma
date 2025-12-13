package edu.hcmute.service;

import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.config.UserMgmtFeignClient;
import edu.hcmute.domain.LeadAction;
import edu.hcmute.dto.AgentLeadActionDto;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.dto.PropertyAgentDto;
import edu.hcmute.dto.PropertyMgmtDto;
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
import java.util.ArrayList;
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
    public AgentLeadActionDto updateLeadActionByAgent(AgentLeadActionDto agentLeadActionDto) {
        if (agentLeadActionDto.leadAction() == LeadAction.ACCEPTED) {
            throw new IllegalArgumentException("Agents cannot manually set status to ACCEPTED. Please send a quote instead.");
        }
        return updateLeadActionInternal(agentLeadActionDto);
    }

    @Override
    @Transactional
    public AgentLeadActionDto updateLeadActionBySystem(AgentLeadActionDto agentLeadActionDto) {
        return updateLeadActionInternal(agentLeadActionDto);
    }

    private AgentLeadActionDto updateLeadActionInternal(AgentLeadActionDto agentLeadActionDto) {
        log.info("~~> update Lead Action: {}", agentLeadActionDto);
        AgentLead agentLead = getOrcreateAgentLead(agentLeadActionDto);
        LeadAction currentAction = agentLead.getLeadAction();
        LeadAction newAction = agentLeadActionDto.leadAction();
        validateStateTransition(currentAction, newAction);
        validateExpiry(agentLead);
        agentLead.setLeadAction(newAction);
        if (agentLead.getId() == 0) {
            agentLead.setId(agentLeadActionDto.id());
        }
        if (agentLead.getCreatedAt() == null) {
            agentLead.setCreatedAt(LocalDateTime.now());
        }
        agentLeadRepo.save(agentLead);
        handleLeadAction(agentLeadActionDto, agentLead, newAction);
        return enrichAgentLeadDto(agentLead);
    }

    private void validateStateTransition(LeadAction currentAction, LeadAction newAction) {
        if (currentAction == null) {
            if (newAction != LeadAction.INTERESTED && newAction != LeadAction.REJECTED) {
                throw new IllegalStateException("Initial action must be INTERESTED or REJECTED. Cannot jump to " + newAction);
            }
        } else if (currentAction != LeadAction.INTERESTED) {
            if (currentAction == LeadAction.ACCEPTED && newAction == LeadAction.REJECTED) {
                log.info("Quote rejected, flipping Agent Action from ACCEPTED to REJECTED");
            } else if (currentAction == newAction) {
                log.info("Action already set to {}, ignoring update", currentAction);
            } else {
                log.warn("Attempting to change final status {} to {}", currentAction, newAction);
            }
        }
    }

    private AgentLead getOrcreateAgentLead(AgentLeadActionDto agentLeadActionDto) {
        if (agentLeadActionDto.id() > 0) {
            return agentLeadRepo.findById(agentLeadActionDto.id())
                    .orElseGet(() -> propertyAgentMapper.toEntity(agentLeadActionDto));
        } else {
            return propertyAgentMapper.toEntity(agentLeadActionDto);
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

    private void handleLeadAction(AgentLeadActionDto agentLeadActionDto, AgentLead agentLead, LeadAction newAction) {
        if (newAction == null) return;
        switch (newAction) {
            case INTERESTED:
                handleInterested(agentLeadActionDto, agentLead);
                break;
            case ACCEPTED:
                log.info("~~> agent accepted (quoted) lead {}.", agentLead.getLeadId());
                break;
            case REJECTED:
                handleRejected(agentLeadActionDto, agentLead);
                break;
        }
    }

    private void handleInterested(AgentLeadActionDto agentLeadActionDto, AgentLead agentLead) {
        log.info("~~> agent is interested in lead {}.", agentLead.getLeadId());
        try {
            propertyLeadFeignClient.updateLeadStatusById(agentLeadActionDto.leadId(), "IN_REVIEWING");
            log.info("~~> lead status updated to IN_REVIEWING");
        } catch (Exception e) {
            log.error("~~> failed to update Lead status to IN_REVIEWING in Lead Service", e);
        }
    }

    private void handleRejected(AgentLeadActionDto agentLeadActionDto, AgentLead agentLead) {
        List<AgentLead> allAgentsForLead = agentLeadRepo.findByLeadId(agentLead.getLeadId());
        boolean allRejected = allAgentsForLead.stream()
                .allMatch(al -> al.getLeadAction() == LeadAction.REJECTED);
        if (allRejected && !allAgentsForLead.isEmpty()) {
            log.info("~~> all agents rejected lead {}.", agentLead.getLeadId());
            try {
                String updatedLeadAction = propertyLeadFeignClient.updateLeadStatusById(agentLeadActionDto.leadId(), String.valueOf(LeadAction.REJECTED));
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
        List<PropertyAgentDto> agents = userMgmtFeignClient.getAgentsByZipCode(zipCode);
        return agents.stream()
                .map(PropertyAgentDto::id)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgentLeadActionDto> getAgentLeads(String agentId) {
        log.info("### Fetching agent leads for agent: {} ###", agentId);
        List<AgentLead> agentLeads = agentLeadRepo.findByAgentId(agentId);
        List<AgentLeadActionDto> dtos = new ArrayList<>();
        for (AgentLead al : agentLeads) {
            dtos.add(enrichAgentLeadDto(al));
        }
        return dtos;
    }

    private AgentLeadActionDto enrichAgentLeadDto(AgentLead al) {
        return new AgentLeadActionDto(
                al.getId(),
                al.getLeadAction(),
                al.getAgentId(),
                al.getLeadId(),
                al.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public List<String> fetchAgentWithinZipCode(String propertyId, int leadId) {
        try {
            log.info("### Fetching agent within zip code for Property ID: {} ###", propertyId);
            PropertyMgmtDto propertyInfo = propertyMgmtFeignClient.fetchAllPropertiesByZipCode("").stream()
                    .filter(p -> p.id().equals(propertyId))
                    .findFirst()
                    .orElse(null);
            if (propertyInfo == null) {
                propertyInfo = propertyMgmtFeignClient.getPropertyInfoById(propertyId);
            }
            if (propertyInfo == null || propertyInfo.propertyAddressDto() == null) {
                log.warn("~~> Property info or address is null for Property ID: {}", propertyId);
                return Collections.emptyList();
            }
            log.info("~~> calling property-info-api to get address-info");
            String zipCode = propertyInfo.propertyAddressDto().zipCode();
            if (StringUtils.hasText(zipCode)) {
                log.info("~~> ZipCode = {}", zipCode);
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
    public PropertyAgentDto getAgentById(String agentId) {
        log.info("### Fetching agent by id: {} ###", agentId);
        return userMgmtFeignClient.getUserById(agentId);
    }
}