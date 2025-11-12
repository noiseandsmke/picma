package edu.hcmute.service;

import edu.hcmute.domain.LeadStatus;
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
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadServiceImpl implements PropertyLeadService {
    private final PropertyLeadRepo propertyLeadRepo;
    private final PropertyLeadDetailRepo propertyLeadDetailRepo;
    private final ModelMapper modelMapper;

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
                log.info("Creating new PropertyLead");
            }
            propertyLead.setUserInfo(propertyLeadDto.getUserInfo());
            propertyLead.setPropertyInfo(propertyLeadDto.getPropertyInfo());
            propertyLead.setStatus(propertyLeadDto.getStatus() != null ? propertyLeadDto.getStatus() : LeadStatus.ACTIVE.name());
            propertyLead.setStartDate(propertyLeadDto.getStartDate() != null ? propertyLeadDto.getStartDate() : LocalDate.now());
            propertyLead.setExpiryDate(propertyLeadDto.getExpiryDate() != null ? propertyLeadDto.getExpiryDate() : LocalDate.now().plusDays(30));
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("PropertyLead saved with id: {}", propertyLead.getId());
            return modelMapper.map(propertyLead, PropertyLeadDto.class);
        } catch (Exception e) {
            log.error("Error creating or updating PropertyLead: {}", e.getMessage(), e);
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
            log.info("Found {} PropertyLeadDetail records for quote Id = {}", leadDetailList.size(), quoteId);
            List<PropertyLead> activeLeadList = leadDetailList.stream()
                    .map(PropertyLeadDetail::getPropertyLead)
                    .filter(Objects::nonNull)
                    .filter(propertyLead -> "ACTIVE".equalsIgnoreCase(propertyLead.getStatus()))
                    .toList();
            if (!activeLeadList.isEmpty()) {
                Integer activeLeadId = activeLeadList.get(0).getId();
                log.info("Lead already ACTIVE with Id = {}", activeLeadId);
                throw new IllegalStateException("Lead already ACTIVE with Id = " + activeLeadId);
            }
            PropertyQuote propertyQuote = leadDetailList.get(0).getPropertyQuote();
            if (propertyQuote == null) {
                throw new IllegalStateException("PropertyQuote not found. Database has orphaned foreign keys. Please check property_quote table.");
            }
            log.info("Found PropertyQuote: id={}, user={}, property={}",
                    propertyQuote.getId(), propertyQuote.getUserInfo(), propertyQuote.getPropertyInfo());
            LocalDate leadExpiryDate = LocalDate.now().plusDays(30);
            if (propertyQuote.getExpiryDate() != null && leadExpiryDate.isAfter(propertyQuote.getExpiryDate())) {
                log.info("Lead expiry projected to exceed quote expiry. Adjusting to quote expiry date.");
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
            log.info("Saved new PropertyLead with Id = {}", propertyLead.getId());
            PropertyLeadDetail propertyLeadDetail = new PropertyLeadDetail();
            propertyLeadDetail.setPropertyLead(propertyLead);
            propertyLeadDetail.setPropertyQuote(propertyQuote);
            propertyLeadDetailRepo.save(propertyLeadDetail);
            return modelMapper.map(propertyLead, PropertyLeadDto.class);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Business logic error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating property lead for quoteId {}: ", quoteId, e);
            throw new RuntimeException("Failed to create property lead: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyLeadDto getPropertyLeadById(Integer leadId) {
        log.info("### Get PropertyLead by Id = {} ###", leadId);
        PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                .orElseThrow(() -> {
                    log.warn("No PropertyLead found with id: {}", leadId);
                    return new RuntimeException("No PropertyLead found with id: " + leadId);
                });

        log.info("Found PropertyLead: {}", propertyLead);
        return modelMapper.map(propertyLead, PropertyLeadDto.class);
    }

    @Override
    public PropertyLeadDto updateLeadStatus(Integer leadId, String status) {
        log.info("### Updating lead status for leadId = {} to status = {} ###", leadId, status);
        try {
            // Validate status
            LeadStatus newStatus;
            try {
                newStatus = LeadStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + status + ". Valid statuses are: " +
                        String.join(", ", java.util.Arrays.stream(LeadStatus.values())
                                .map(Enum::name).toArray(String[]::new)));
            }
            PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                    .orElseThrow(() -> new RuntimeException("PropertyLead not found with id: " + leadId));
            if (LeadStatus.ACTIVE.name().equalsIgnoreCase(propertyLead.getStatus())
                    && LeadStatus.ACCEPTED.name().equals(newStatus.name())) {
                propertyLead.setStatus(newStatus.name());
                propertyLead.setModifiedBy("noiseandsmke");
                propertyLead.setModifiedAt(Instant.now());
                propertyLead = propertyLeadRepo.save(propertyLead);
                log.info("Updated PropertyLead status to: {}", newStatus.name());
            } else {
                throw new RuntimeException("Cannot update lead status. Lead must be ACTIVE to be ACCEPTED. Current status: " + propertyLead.getStatus());
            }
            return modelMapper.map(propertyLead, PropertyLeadDto.class);
        } catch (Exception e) {
            log.error("Error updating lead status: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public List<PropertyLeadDto> findAllPropertyLeads() {
        log.info("### Get All PropertyLeads ###");
        List<PropertyLead> propertyLeadList = propertyLeadRepo.findAll().stream()
                .filter(lead -> LeadStatus.ACTIVE.name().equalsIgnoreCase(lead.getStatus()))
                .toList();
        if (propertyLeadList.isEmpty()) {
            log.warn("No active PropertyLeads found in database");
            return List.of();
        }
        log.info("Found {} active PropertyLeads", propertyLeadList.size());
        return propertyLeadList.stream()
                .map(lead -> modelMapper.map(lead, PropertyLeadDto.class))
                .toList();
    }

    @Override
    public List<PropertyLeadDto> findPropertyLeadsByStatus(String status) {
        log.info("### Get PropertyLeads by status = {} ###", status);
        try {
            LeadStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
        List<PropertyLead> propertyLeadList = propertyLeadRepo.findByStatus(status.toUpperCase());
        if (propertyLeadList.isEmpty()) {
            log.warn("No PropertyLeads found with status: {}", status);
            return List.of();
        }
        log.info("Found {} PropertyLeads with status: {}", propertyLeadList.size(), status);
        return propertyLeadList.stream()
                .map(lead -> modelMapper.map(lead, PropertyLeadDto.class))
                .toList();
    }

    @Override
    public List<PropertyLeadDto> findPropertyLeadsByZipcode(Integer zipcode) {
        return List.of();
    }

    @Override
    public List<PropertyLeadDto> findPropertyLeadsOfAgent(Integer agentId) {
        return List.of();
    }

    @Override
    public List<PropertyLeadDto> deletePropertyLeadById(Integer leadId) {
        log.info("### Delete PropertyLead by id = {} ###", leadId);
        try {
            List<PropertyLeadDetail> leadDetailList = propertyLeadDetailRepo.findAll().stream()
                    .filter(detail -> detail.getPropertyLead() != null && detail.getPropertyLead().getId().equals(leadId))
                    .toList();
            if (!leadDetailList.isEmpty()) {
                propertyLeadDetailRepo.deleteAll(leadDetailList);
                log.info("Deleted {} PropertyLeadDetail records", leadDetailList.size());
            }
            propertyLeadRepo.deleteById(leadId);
            log.info("Deleted PropertyLead with id: {}", leadId);
            return findAllPropertyLeads();
        } catch (Exception e) {
            log.error("Error deleting PropertyLead: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete PropertyLead: " + e.getMessage(), e);
        }
    }
}