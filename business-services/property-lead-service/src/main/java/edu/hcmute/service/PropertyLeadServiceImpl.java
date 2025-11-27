package edu.hcmute.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyAgentFeignClient;
import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.domain.LeadStatus;
import edu.hcmute.dto.*;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.event.PropertyLeadProducer;
import edu.hcmute.mapper.PropertyLeadMapper;
import edu.hcmute.repo.PropertyLeadRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadServiceImpl implements PropertyLeadService {
    private final PropertyLeadRepo propertyLeadRepo;
    private final PropertyMgmtFeignClient propertyMgmtFeignClient;
    private final PropertyAgentFeignClient propertyAgentFeignClient;
    private final PropertyLeadMapper propertyLeadMapper;
    private final PropertyLeadProducer propertyLeadProducer;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public PropertyLeadDto createPropertyLead(PropertyLeadDto propertyLeadDto) {
        log.info("### Create PropertyLead ###");
        log.info("PropertyLeadDto: {}", propertyLeadDto);
        try {
            PropertyLead propertyLead = propertyLeadMapper.toEntity(propertyLeadDto);
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("~~> PropertyLead saved with id: {}", propertyLead.getId());
            boolean isPublished = propertyLeadProducer.publishLead(propertyLead);
            log.info("~~> Lead published to Kafka: {}", isPublished);
            return propertyLeadMapper.toDto(propertyLead);
        } catch (Exception e) {
            log.error("~~> error creating PropertyLead: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create PropertyLead: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PropertyLeadDto updatePropertyLead(Integer leadId, PropertyLeadDto propertyLeadDto) {
        log.info("### Update PropertyLead with id: {} ###", leadId);
        try {
            PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                    .orElseThrow(() -> new RuntimeException("PropertyLead not found with id: " + leadId));
            propertyLeadMapper.updateEntity(propertyLead, propertyLeadDto);
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("~~> PropertyLead updated with id: {}", propertyLead.getId());
            return propertyLeadMapper.toDto(propertyLead);
        } catch (Exception e) {
            log.error("~~> error updating PropertyLead: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update PropertyLead: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyLeadDto getPropertyLeadById(Integer leadId) {
        log.info("### Get PropertyLead by Id = {} ###", leadId);
        PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                .orElseThrow(() -> {
                    log.warn("~~> no PropertyLead found with id: {}", leadId);
                    return new RuntimeException("No PropertyLead found with id: " + leadId);
                });
        log.info("~~> found PropertyLead: {}", propertyLead);
        return propertyLeadMapper.toDto(propertyLead);
    }

    @Override
    @Transactional
    public PropertyLeadDto updateLeadStatus(Integer leadId, String status) {
        log.info("### Updating lead status for leadId = {} to status = {} ###", leadId, status);
        try {
            LeadStatus newStatus;
            try {
                newStatus = LeadStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + status + ". Valid statuses are: " +
                        String.join(", ", Arrays.stream(LeadStatus.values())
                                .map(Enum::name).toArray(String[]::new)));
            }
            PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                    .orElseThrow(() -> new RuntimeException("PropertyLead not found with id: " + leadId));
            LeadStatus currentStatus = propertyLead.getStatus();
            validateStatusTransition(currentStatus, newStatus);
            propertyLead.setStatus(newStatus);
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("~~> successfully updated PropertyLead status from {} to {}", currentStatus.name(), newStatus.name());
            return propertyLeadMapper.toDto(propertyLead);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("~~> validation error updating lead status: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("~~> error updating lead status: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update lead status: " + e.getMessage(), e);
        }
    }

    private void validateStatusTransition(LeadStatus currentStatus, LeadStatus newStatus) {
        if (currentStatus == newStatus) {
            log.info("~~> status unchanged: {}", currentStatus.name());
            return;
        }
        switch (currentStatus) {
            case ACTIVE:
                if (newStatus != LeadStatus.IN_REVIEWING && newStatus != LeadStatus.ACCEPTED && newStatus != LeadStatus.REJECTED && newStatus != LeadStatus.EXPIRED) {
                    throw new IllegalStateException(
                            String.format("Invalid status transition from %s to %s. ACTIVE leads can only be changed to IN_REVIEWING, ACCEPTED, REJECTED, or EXPIRED.",
                                    currentStatus, newStatus));
                }
                break;
            case IN_REVIEWING:
                if (newStatus != LeadStatus.ACTIVE && newStatus != LeadStatus.ACCEPTED && newStatus != LeadStatus.REJECTED && newStatus != LeadStatus.EXPIRED) {
                    throw new IllegalStateException(
                            String.format("Invalid status transition from %s to %s. IN_REVIEWING leads can be changed to ACTIVE, ACCEPTED, REJECTED, or EXPIRED.",
                                    currentStatus, newStatus));
                }
                break;
            case ACCEPTED:
                if (newStatus != LeadStatus.EXPIRED) {
                    throw new IllegalStateException(
                            String.format("Invalid status transition from %s to %s. ACCEPTED leads can only be changed to EXPIRED.",
                                    currentStatus, newStatus));
                }
                break;
            case REJECTED:
            case EXPIRED:
                throw new IllegalStateException(
                        String.format("Cannot change status from %s to %s. %s is a final state.",
                                currentStatus, newStatus, currentStatus));
            default:
                throw new IllegalStateException(String.format("Unknown status: %s", currentStatus));
        }
        log.info("~~> status transition validated: {} -> {}", currentStatus.name(), newStatus.name());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findAllPropertyLeads() {
        log.info("### Get All ACTIVE PropertyLeads ###");
        List<PropertyLead> propertyLeadList = propertyLeadRepo.findByStatus(LeadStatus.ACTIVE);
        if (propertyLeadList.isEmpty()) {
            log.warn("~~> no ACTIVE PropertyLeads found in database");
            return List.of();
        }
        log.info("~~> found {} active PropertyLeads", propertyLeadList.size());
        return propertyLeadList.stream().map(propertyLeadMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findPropertyLeadsByStatus(String status) {
        log.info("### Get PropertyLeads by status = {} ###", status);
        LeadStatus leadStatus;
        try {
            leadStatus = LeadStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
        List<PropertyLead> propertyLeadList = propertyLeadRepo.findByStatus(leadStatus);
        if (propertyLeadList.isEmpty()) {
            log.warn("~~> no PropertyLeads found with status: {}", status);
            return List.of();
        }
        log.info("~~> found {} PropertyLeads with status: {}", propertyLeadList.size(), status);
        return propertyLeadList.stream().map(propertyLeadMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findPropertyLeadsByZipcode(String zipcode) {
        log.info("### Get PropertyLeads by zipcode = {} ###", zipcode);
        try {
            List<PropertyInfoDto> propertiesList = propertyMgmtFeignClient.fetchAllPropertiesByZipCode(zipcode);
            if (propertiesList == null || propertiesList.isEmpty()) {
                log.warn("~~> no properties found for zipcode: {}", zipcode);
                return List.of();
            }
            List<String> propertyIds = propertiesList.stream()
                    .map(PropertyInfoDto::id)
                    .toList();
            if (propertyIds.isEmpty()) {
                log.warn("~~> no property IDs extracted for zipcode: {}", zipcode);
                return List.of();
            }
            log.info("~~> found {} property Ids in zipcode {}", propertyIds.size(), zipcode);
            List<PropertyLead> matchingLeads = propertyLeadRepo.findByStatusIn(Arrays.asList(LeadStatus.ACTIVE, LeadStatus.IN_REVIEWING)).stream()
                    .filter(lead -> propertyIds.contains(lead.getPropertyInfo()))
                    .toList();
            log.info("~~> found {} ACTIVE or IN_REVIEWING leads for zipcode {}", matchingLeads.size(), zipcode);
            return matchingLeads.stream().map(propertyLeadMapper::toDto).toList();
        } catch (Exception e) {
            log.error("~~> error fetching leads by zipcode {}: {}", zipcode, e.getMessage(), e);
            return List.of();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findPropertyLeadsOfAgent(String agentId) {
        log.info("### Get property leads visible to agent {} ###", agentId);
        try {
            AgentDto agent = propertyAgentFeignClient.getAgentById(agentId);
            String agentZipCode = agent.zipCode();
            log.info("~~> agent {} has zipCode: {}", agentId, agentZipCode);
            List<PropertyLeadDto> availableLeadsDtos = findPropertyLeadsByZipcode(agentZipCode);
            List<PropertyLead> availableLeads = availableLeadsDtos.stream()
                    .map(propertyLeadMapper::toEntity)
                    .toList();
            log.info("~~> found {} available leads by zipcode {}", availableLeads.size(), agentZipCode);
            List<AgentLeadDto> interactedAgentLeads = getAgentLeadsForAgent(agentId);
            Set<Integer> interactedLeadIds = interactedAgentLeads.stream()
                    .map(AgentLeadDto::leadId)
                    .collect(Collectors.toSet());
            List<PropertyLead> interactedLeads = propertyLeadRepo.findAllById(interactedLeadIds);
            Set<Integer> rejectedLeadIds = interactedAgentLeads.stream()
                    .filter(al -> "REJECTED".equalsIgnoreCase(al.leadAction()))
                    .map(AgentLeadDto::leadId)
                    .collect(Collectors.toSet());
            List<PropertyLead> visibleLeads = new ArrayList<>();
            for (PropertyLead lead : availableLeads) {
                if (!rejectedLeadIds.contains(lead.getId())) {
                    visibleLeads.add(lead);
                }
            }
            for (PropertyLead lead : interactedLeads) {
                if (visibleLeads.stream().anyMatch(l -> l.getId().equals(lead.getId()))) {
                    continue;
                }
                if (rejectedLeadIds.contains(lead.getId())) {
                    continue;
                }
                visibleLeads.add(lead);
            }
            Set<PropertyLead> uniqueLeads = new HashSet<>(visibleLeads);
            log.info("~~> total {} leads visible to agent {}", uniqueLeads.size(), agentId);
            return uniqueLeads.stream()
                    .map(propertyLeadMapper::toDto)
                    .sorted(Comparator.comparing(PropertyLeadDto::id))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("~~> error fetching leads for agent {}: {}", agentId, e.getMessage(), e);
            return findAllPropertyLeads();
        }
    }

    private List<AgentLeadDto> getAgentLeadsForAgent(String agentId) {
        try {
            String agentLeadsJson = propertyAgentFeignClient.getAgentLeadsByAgentId(agentId);
            if (agentLeadsJson == null || agentLeadsJson.trim().isEmpty()) {
                return Collections.emptyList();
            }
            return objectMapper.readValue(agentLeadsJson, new TypeReference<>() {
            });
        } catch (Exception e) {
            log.error("~~> error fetching agent leads: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public void deletePropertyLeadById(Integer leadId) {
        log.info("### Delete PropertyLead by id = {} ###", leadId);
        if (!propertyLeadRepo.existsById(leadId)) {
            throw new RuntimeException("PropertyLead not found with id: " + leadId);
        }
        propertyLeadRepo.deleteById(leadId);
        log.info("~~> successfully deleted PropertyLead with id: {}", leadId);
    }

    @Override
    @Transactional(readOnly = true)
    public LeadStatsDto getLeadStats() {
        log.info("### Get Lead Stats ###");
        List<PropertyLead> allLeads = propertyLeadRepo.findAll();
        long total = allLeads.size();
        long accepted = allLeads.stream().filter(l -> LeadStatus.ACCEPTED == l.getStatus()).count();
        long rejected = allLeads.stream().filter(l -> LeadStatus.REJECTED == l.getStatus()).count();
        long overdue = allLeads.stream().filter(l -> LeadStatus.EXPIRED == l.getStatus() ||
                (l.getExpiryDate() != null && l.getExpiryDate().isBefore(LocalDate.now()))).count();
        return new LeadStatsDto(total, accepted, rejected, overdue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> getAllLeads(String sort, String order) {
        log.info("### Get All PropertyLeads ###");
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(order);
        } catch (IllegalArgumentException e) {
            direction = Sort.Direction.ASC;
        }
        Sort sorter = Sort.by(direction, sort);
        List<PropertyLead> propertyLeadList = propertyLeadRepo.findAll(sorter);
        if (propertyLeadList.isEmpty()) {
            return List.of();
        }
        log.info("~~> found {} PropertyLeads", propertyLeadList.size());
        return propertyLeadList.stream().map(propertyLeadMapper::toDto).toList();
    }
}