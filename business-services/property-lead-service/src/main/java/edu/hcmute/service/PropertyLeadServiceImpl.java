package edu.hcmute.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyAgentFeignClient;
import edu.hcmute.config.PropertyMgmtFeignClient;
import edu.hcmute.domain.LeadStatus;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.entity.PropertyLeadDetail;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.repo.PropertyLeadDetailRepo;
import edu.hcmute.repo.PropertyLeadRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadServiceImpl implements PropertyLeadService {
    private final PropertyLeadRepo propertyLeadRepo;
    private final PropertyLeadDetailRepo propertyLeadDetailRepo;
    private final PropertyMgmtFeignClient propertyMgmtFeignClient;
    private final PropertyAgentFeignClient propertyAgentFeignClient;
    private final ModelMapper modelMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public PropertyLeadDto createOrUpdatePropertyLead(PropertyLeadDto propertyLeadDto) {
        log.info("### Create or Update PropertyLead ###");
        try {
            PropertyLead propertyLead;
            if (propertyLeadDto.getId() != null) {
                propertyLead = propertyLeadRepo.findById(propertyLeadDto.getId())
                        .orElseThrow(() -> new RuntimeException("PropertyLead not found with id: " + propertyLeadDto.getId()));
                log.info("Updating existing PropertyLead with id: {}", propertyLeadDto.getId());
                propertyLead.setModifiedBy("noiseandsmke");
                propertyLead.setModifiedAt(Instant.now());
            } else {
                propertyLead = new PropertyLead();
                propertyLead.setCreatedBy("noiseandsmke");
                propertyLead.setCreatedAt(Instant.now());
                propertyLead.setModifiedBy("noiseandsmke");
                propertyLead.setModifiedAt(Instant.now());
                log.info("~~> creating new PropertyLead");
            }
            propertyLead.setUserInfo(propertyLeadDto.getUserInfo());
            propertyLead.setPropertyInfo(propertyLeadDto.getPropertyInfo());
            propertyLead.setStatus(propertyLeadDto.getStatus() != null ? propertyLeadDto.getStatus() : LeadStatus.ACTIVE.name());
            propertyLead.setStartDate(propertyLeadDto.getStartDate() != null ? propertyLeadDto.getStartDate() : LocalDate.now());
            propertyLead.setExpiryDate(propertyLeadDto.getExpiryDate() != null ? propertyLeadDto.getExpiryDate() : LocalDate.now().plusDays(30));
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("~~> PropertyLead saved with id: {}", propertyLead.getId());
            return modelMapper.map(propertyLead, PropertyLeadDto.class);
        } catch (Exception e) {
            log.error("~~> error creating or updating PropertyLead: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create or update PropertyLead: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PropertyLeadDto createPropertyLeadByQuote(Integer quoteId) {
        log.info("### Creating property lead by Quote Id = {} ###", quoteId);
        try {
            List<PropertyLeadDetail> leadDetailList = propertyLeadDetailRepo.findByPropertyQuoteId(quoteId);
            if (leadDetailList.isEmpty()) {
                throw new IllegalArgumentException("Quote " + quoteId + " not found or has no associated data. Create quote first.");
            }
            log.info("~~> found {} PropertyLeadDetail records for quote Id = {}", leadDetailList.size(), quoteId);
            List<PropertyLead> activeLeadList = leadDetailList.stream()
                    .map(PropertyLeadDetail::getPropertyLead)
                    .filter(Objects::nonNull)
                    .filter(propertyLead -> "ACTIVE".equalsIgnoreCase(propertyLead.getStatus()))
                    .toList();
            if (!activeLeadList.isEmpty()) {
                Integer activeLeadId = activeLeadList.get(0).getId();
                log.info("~~> lead already ACTIVE with Id = {}", activeLeadId);
                throw new IllegalStateException("Lead already ACTIVE with Id = " + activeLeadId);
            }
            PropertyQuote propertyQuote = leadDetailList.get(0).getPropertyQuote();
            if (propertyQuote == null) {
                throw new IllegalStateException("PropertyQuote not found. Database has orphaned foreign keys. Please check property_quote table.");
            }
            log.info("~~> found PropertyQuote: id={}, user={}, property={}",
                    propertyQuote.getId(), propertyQuote.getUserInfo(), propertyQuote.getPropertyInfo());
            LocalDate leadExpiryDate = LocalDate.now().plusDays(30);
            if (propertyQuote.getExpiryDate() != null && leadExpiryDate.isAfter(propertyQuote.getExpiryDate())) {
                log.info("~~> lead expiry projected to exceed quote expiry. Adjusting to quote expiry date.");
                leadExpiryDate = propertyQuote.getExpiryDate();
            }
            PropertyLead propertyLead = PropertyLead.builder()
                    .userInfo(propertyQuote.getUserInfo())
                    .propertyInfo(propertyQuote.getPropertyInfo())
                    .status("ACTIVE")
                    .startDate(LocalDate.now())
                    .expiryDate(leadExpiryDate)
                    .build();
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("~~> saved new PropertyLead with Id = {}", propertyLead.getId());
            PropertyLeadDetail propertyLeadDetail = new PropertyLeadDetail();
            propertyLeadDetail.setPropertyLead(propertyLead);
            propertyLeadDetail.setPropertyQuote(propertyQuote);
            propertyLeadDetailRepo.save(propertyLeadDetail);
            return modelMapper.map(propertyLead, PropertyLeadDto.class);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("~~> business logic error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("~~> unexpected error creating property lead for quoteId {}: ", quoteId, e);
            throw new RuntimeException("Failed to create property lead: " + e.getMessage(), e);
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
        return modelMapper.map(propertyLead, PropertyLeadDto.class);
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
                        String.join(", ", java.util.Arrays.stream(LeadStatus.values())
                                .map(Enum::name).toArray(String[]::new)));
            }

            PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                    .orElseThrow(() -> new RuntimeException("PropertyLead not found with id: " + leadId));
            LeadStatus currentStatus = LeadStatus.valueOf(propertyLead.getStatus());
            validateStatusTransition(currentStatus, newStatus);

            propertyLead.setStatus(newStatus.name());
            propertyLead.setModifiedBy("noiseandsmke");
            propertyLead.setModifiedAt(Instant.now());
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("~~> successfully updated PropertyLead status from {} to {}", currentStatus.name(), newStatus.name());
            return modelMapper.map(propertyLead, PropertyLeadDto.class);
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
                if (newStatus != LeadStatus.ACCEPTED && newStatus != LeadStatus.REJECTED && newStatus != LeadStatus.EXPIRED) {
                    throw new IllegalStateException(
                            String.format("Invalid status transition from %s to %s. " +
                                            "ACTIVE leads can only be changed to ACCEPTED, REJECTED, or EXPIRED.",
                                    currentStatus, newStatus));
                }
                break;
            case ACCEPTED:
                if (newStatus != LeadStatus.EXPIRED) {
                    throw new IllegalStateException(
                            String.format("Invalid status transition from %s to %s. " +
                                            "ACCEPTED leads can only be changed to EXPIRED.",
                                    currentStatus, newStatus));
                }
                break;
            case REJECTED:
            case EXPIRED:
                throw new IllegalStateException(
                        String.format("Cannot change status from %s to %s. " +
                                        "%s is a final state and cannot be changed.",
                                currentStatus, newStatus, currentStatus));
            default:
                throw new IllegalStateException(
                        String.format("Unknown status: %s", currentStatus));
        }
        log.info("~~> status transition validated: {} -> {}", currentStatus.name(), newStatus.name());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findAllPropertyLeads() {
        log.info("### Get All ACTIVE PropertyLeads ###");
        List<PropertyLead> propertyLeadList = propertyLeadRepo.findAll().stream()
                .filter(lead -> LeadStatus.ACTIVE.name().equalsIgnoreCase(lead.getStatus()))
                .toList();
        if (propertyLeadList.isEmpty()) {
            log.warn("~~> no ACTIVE PropertyLeads found in database");
            return List.of();
        }
        log.info("~~> found {} active PropertyLeads", propertyLeadList.size());
        return propertyLeadList.stream()
                .map(lead -> modelMapper.map(lead, PropertyLeadDto.class))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findPropertyLeadsByStatus(String status) {
        log.info("### Get PropertyLeads by status = {} ###", status);
        try {
            LeadStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
        List<PropertyLead> propertyLeadList = propertyLeadRepo.findByStatus(status.toUpperCase());
        if (propertyLeadList.isEmpty()) {
            log.warn("~~> no PropertyLeads found with status: {}", status);
            return List.of();
        }
        log.info("~~> found {} PropertyLeads with status: {}", propertyLeadList.size(), status);
        return propertyLeadList.stream()
                .map(lead -> modelMapper.map(lead, PropertyLeadDto.class))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findPropertyLeadsByZipcode(String zipcode) {
        log.info("### Get PropertyLeads by zipcode = {} ###", zipcode);
        try {
            String propertiesJson = propertyMgmtFeignClient.fetchAllPropertiesByZipCode(zipcode);
            if (propertiesJson == null || propertiesJson.trim().isEmpty()) {
                log.warn("~~> no properties found for zipcode: {}", zipcode);
                return List.of();
            }
            List<String> propertyIds = extractPropertyIdsFromJson(propertiesJson);
            if (propertyIds.isEmpty()) {
                log.warn("~~> no property IDs extracted for zipcode: {}", zipcode);
                return List.of();
            }

            log.info("~~> found {} property Ids in zipcode {}", propertyIds.size(), zipcode);
            List<PropertyLead> matchingLeads = propertyLeadRepo.findAll().stream()
                    .filter(lead -> propertyIds.contains(lead.getPropertyInfo()))
                    .filter(lead -> LeadStatus.ACTIVE.name().equalsIgnoreCase(lead.getStatus()))
                    .toList();

            log.info("~~> found {} ACTIVE leads for zipcode {}", matchingLeads.size(), zipcode);
            matchingLeads.forEach(lead -> log.info(lead.toString()));

            return matchingLeads.stream()
                    .map(lead -> modelMapper.map(lead, PropertyLeadDto.class))
                    .toList();
        } catch (Exception e) {
            log.error("~~> error fetching leads by zipcode {}: {}", zipcode, e.getMessage(), e);
            return List.of();
        }
    }

    private List<String> extractPropertyIdsFromJson(String propertiesJson) {
        try {
            JsonNode rootNode = objectMapper.readTree(propertiesJson);
            List<String> propertyIds = new ArrayList<>();
            if (rootNode.isArray()) {
                for (JsonNode node : rootNode) {
                    if (node.has("id")) {
                        propertyIds.add(node.get("id").asText());
                    }
                }
            } else if (rootNode.has("id")) {
                propertyIds.add(rootNode.get("id").asText());
            }
            return propertyIds;
        } catch (Exception e) {
            log.error("~~> error parsing properties JSON: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findPropertyLeadsOfAgent(String agentId) {
        log.info("### Get property leads visible to agent {} ###", agentId);
        try {
            List<PropertyLead> activeLeads = propertyLeadRepo.findByStatus(LeadStatus.ACTIVE.name());
            log.info("~~> found {} ACTIVE leads visible to all agents", activeLeads.size());

            List<Integer> acceptedLeadIds = getAcceptedLeadIdsForAgent(agentId);
            log.info("~~> agent {} has accepted {} leads", agentId, acceptedLeadIds.size());

            List<PropertyLead> acceptedLeads = acceptedLeadIds.isEmpty()
                    ? Collections.emptyList()
                    : propertyLeadRepo.findAllById(acceptedLeadIds);
            Set<PropertyLead> allVisibleLeads = new HashSet<>();
            allVisibleLeads.addAll(activeLeads);
            allVisibleLeads.addAll(acceptedLeads);
            log.info("~~> total {} leads visible to agent {}", allVisibleLeads.size(), agentId);
            return allVisibleLeads.stream()
                    .map(lead -> modelMapper.map(lead, PropertyLeadDto.class))
                    .sorted(Comparator.comparing(PropertyLeadDto::getId))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("~~> error fetching leads for agent {}: {}", agentId, e.getMessage(), e);
            log.warn("~~> falling back to returning only ACTIVE leads due to error");
            return findAllPropertyLeads();
        }
    }

    private List<Integer> getAcceptedLeadIdsForAgent(String agentId) {
        try {
            String agentLeadsJson = propertyAgentFeignClient.getAgentLeadsByAgentId(agentId);
            if (agentLeadsJson == null || agentLeadsJson.trim().isEmpty()) {
                log.info("~~> no agent leads found for agent {}", agentId);
                return Collections.emptyList();
            }
            List<AgentLeadDto> agentLeads = objectMapper.readValue(
                    agentLeadsJson,
                    new TypeReference<>() {
                    }
            );
            return agentLeads.stream()
                    .filter(al -> "ACCEPTED".equalsIgnoreCase(al.getLeadAction()))
                    .map(AgentLeadDto::getLeadId)
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("~~> error fetching agent leads from agent service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public List<PropertyLeadDto> deletePropertyLeadById(Integer leadId) {
        log.info("### Delete PropertyLead by id = {} ###", leadId);
        try {
            if (!propertyLeadRepo.existsById(leadId)) {
                log.warn("~~> PropertyLead with id {} does not exist", leadId);
                throw new RuntimeException("PropertyLead not found with id: " + leadId);
            }
            List<PropertyLeadDetail> leadDetailList = propertyLeadDetailRepo.findAll().stream()
                    .filter(detail -> detail.getPropertyLead() != null && detail.getPropertyLead().getId().equals(leadId))
                    .toList();
            if (!leadDetailList.isEmpty()) {
                propertyLeadDetailRepo.deleteAll(leadDetailList);
                log.info("~~> deleted {} PropertyLeadDetail records", leadDetailList.size());
            }
            propertyLeadRepo.deleteById(leadId);
            log.info("~~> successfully deleted PropertyLead with id: {}", leadId);
            return findAllPropertyLeads();
        } catch (Exception e) {
            log.error("~~> error deleting PropertyLead: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete PropertyLead: " + e.getMessage(), e);
        }
    }
}