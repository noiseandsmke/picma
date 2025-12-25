package edu.hcmute.service;

import edu.hcmute.client.PropertyMgmtFeignClient;
import edu.hcmute.client.PropertyQuoteFeignClient;
import edu.hcmute.domain.LeadStatus;
import edu.hcmute.dto.LeadStatsDto;
import edu.hcmute.dto.LeadTrendDto;
import edu.hcmute.dto.PropertyLeadDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.exception.PropertyLeadException;
import edu.hcmute.mapper.PropertyLeadMapper;
import edu.hcmute.repo.PropertyLeadRepo;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyLeadServiceImpl implements PropertyLeadService {
    private final PropertyLeadRepo propertyLeadRepo;
    private final PropertyQuoteFeignClient propertyQuoteFeignClient;
    private final PropertyMgmtFeignClient propertyMgmtFeignClient;
    private final PropertyLeadMapper propertyLeadMapper;

    @Override
    @Transactional
    public PropertyLeadDto createPropertyLead(PropertyLeadDto propertyLeadDto) {
        log.info("### Create PropertyLead ###");
        log.info("PropertyLeadDto: {}", propertyLeadDto);
        try {
            PropertyLead propertyLead = propertyLeadMapper.toEntity(propertyLeadDto);
            if (!StringUtils.hasText(propertyLead.getZipCode())) {
                throw new IllegalArgumentException("ZipCode is required to create a property lead.");
            }
            propertyLead.setStatus(LeadStatus.NEW);
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("~~> PropertyLead saved with id: {}", propertyLead.getId());
            return propertyLeadMapper.toDto(propertyLead);
        } catch (Exception e) {
            log.error("~~> error creating PropertyLead: {}", e.getMessage(), e);
            throw new PropertyLeadException("Failed to create PropertyLead: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PropertyLeadDto updatePropertyLead(Integer leadId, PropertyLeadDto propertyLeadDto) {
        log.info("### Update PropertyLead with id: {} ###", leadId);
        try {
            PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                    .orElseThrow(() -> new PropertyLeadException("PropertyLead not found with id: " + leadId));
            if (propertyLead.getStatus() != LeadStatus.NEW) {
                throw new PropertyLeadException("Cannot update PropertyLead. Lead is in " + propertyLead.getStatus() + " status. Only NEW leads can be updated.");
            }
            propertyLeadMapper.updateEntity(propertyLead, propertyLeadDto);
            propertyLead = propertyLeadRepo.save(propertyLead);
            log.info("~~> PropertyLead updated with id: {}", propertyLead.getId());
            return propertyLeadMapper.toDto(propertyLead);
        } catch (Exception e) {
            log.error("~~> error updating PropertyLead: {}", e.getMessage(), e);
            throw new PropertyLeadException("Failed to update PropertyLead: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyLeadDto getPropertyLeadById(Integer leadId) {
        log.info("### Get PropertyLead by Id = {} ###", leadId);
        PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                .orElseThrow(() -> {
                    log.warn("~~> no PropertyLead found with id: {}", leadId);
                    return new PropertyLeadException("No PropertyLead found with id: " + leadId);
                });
        log.info("~~> found PropertyLead: {}", propertyLead);
        return propertyLeadMapper.toDto(propertyLead);
    }

    @Override
    @Transactional
    public PropertyLeadDto updatePropertyLeadStatus(Integer leadId, String status) {
        log.info("### Updating lead status for leadId = {} to {} ###", leadId, status);
        try {
            PropertyLead propertyLead = propertyLeadRepo.findById(leadId)
                    .orElseThrow(() -> new PropertyLeadException("PropertyLead not found with id: " + leadId));
            LeadStatus newStatus;
            try {
                newStatus = LeadStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new PropertyLeadException("Invalid status: " + status);
            }
            if (newStatus == LeadStatus.ACCEPTED || newStatus == LeadStatus.IN_REVIEW) {
                if (propertyLead.getStatus() == LeadStatus.ACCEPTED) {
                    log.warn("~~> Lead is already ACCEPTED. Ignoring status update.");
                    return propertyLeadMapper.toDto(propertyLead);
                }
                propertyLead.setStatus(newStatus);
                propertyLead = propertyLeadRepo.save(propertyLead);
                log.info("~~> successfully updated PropertyLead status to {}", newStatus);
            } else {
                log.warn("~~> Unsupported status transition to {}. Only IN_REVIEW and ACCEPTED allowed via this endpoint.", newStatus);
            }
            return propertyLeadMapper.toDto(propertyLead);
        } catch (Exception e) {
            log.error("~~> error updating lead status: {}", e.getMessage(), e);
            throw new PropertyLeadException("Failed to update lead status: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> getAllPropertyLeads(String sortBy, String sortDirection, String status) {
        log.info("### Get all PropertyLeads sorted by {} {} with status filter {} ###", sortBy, sortDirection, status);
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Sort sort = Sort.by(direction, sortBy);
        Specification<PropertyLead> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(status)) {
                try {
                    LeadStatus leadStatus = LeadStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), leadStatus));
                } catch (IllegalArgumentException e) {
                    log.warn("~~> invalid status filter: {}", status);
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        List<PropertyLead> propertyLeadList = propertyLeadRepo.findAll(spec, sort);
        log.info("~~> found {} PropertyLeads", propertyLeadList.size());
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
            throw new PropertyLeadException("Invalid status: " + status);
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
    public List<PropertyLeadDto> findPropertyLeadsByZipCode(String zipCode) {
        log.info("### Get ALL PropertyLeads by zipcode = {} ###", zipCode);
        List<PropertyLead> leads = propertyLeadRepo.findByZipCode(zipCode);
        log.info("~~> found {} total leads for zipcode {}", leads.size(), zipCode);
        return leads.stream().map(propertyLeadMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLeadDto> findPropertyLeadsByUser(String userId) {
        log.info("### Get property leads for user {} ###", userId);
        List<PropertyLead> leads = propertyLeadRepo.findByUserInfo(userId);
        log.info("~~> found {} leads for user {}", leads.size(), userId);
        return leads.stream().map(propertyLeadMapper::toDto).toList();
    }

    @Override
    @Transactional
    public void deletePropertyLeadById(Integer leadId) {
        log.info("### Delete PropertyLead by id = {} ###", leadId);
        if (!propertyLeadRepo.existsById(leadId)) {
            throw new PropertyLeadException("PropertyLead not found with id: " + leadId);
        }
        try {
            List<PropertyQuoteDto> quotes = propertyQuoteFeignClient.getQuotesByLeadId(leadId);
            if (!quotes.isEmpty()) {
                throw new PropertyLeadException("Cannot delete Lead with id " + leadId + " because it has associated Quotes. Please delete the quotes first.");
            }
        } catch (Exception e) {
            if (e instanceof PropertyLeadException) {
                throw e;
            }
            log.error("~~> Failed to check quotes for leadId {}: {}", leadId, e.getMessage());
            throw new PropertyLeadException("Failed to verify if lead has quotes. Cannot delete safely.", e);
        }
        String propertyInfoId = propertyLeadRepo.findById(leadId)
                .map(PropertyLead::getPropertyInfo)
                .orElse(null);
        propertyLeadRepo.deleteById(leadId);
        log.info("~~> successfully deleted PropertyLead with id: {}", leadId);
        if (StringUtils.hasText(propertyInfoId)) {
            try {
                propertyMgmtFeignClient.deletePropertyById(propertyInfoId);
                log.info("~~> successfully deleted associated PropertyInfo with id: {}", propertyInfoId);
            } catch (Exception e) {
                log.error("~~> Failed to delete associated PropertyInfo {}: {}", propertyInfoId, e.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public LeadStatsDto getLeadStats() {
        log.info("### Get lead stats ###");
        List<PropertyLead> allLeads = propertyLeadRepo.findAll();
        long total = allLeads.size();
        long newLeads = allLeads.stream().filter(l -> LeadStatus.NEW == l.getStatus()).count();
        long inReviewLeads = allLeads.stream().filter(l -> LeadStatus.IN_REVIEW == l.getStatus()).count();
        long acceptedLeads = allLeads.stream().filter(l -> LeadStatus.ACCEPTED == l.getStatus()).count();
        LeadStatsDto stats = new LeadStatsDto(total, newLeads, inReviewLeads, acceptedLeads);
        log.info("~~> calculated stats: {}", stats);
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeadTrendDto> getLeadTrend() {
        log.info("### Get lead trend last 7 days ###");
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        List<PropertyLead> recentLeads = propertyLeadRepo.findByCreateDateGreaterThanEqual(startDate);
        Map<LocalDate, Long> trendMap = recentLeads.stream()
                .collect(Collectors.groupingBy(
                        PropertyLead::getCreateDate,
                        Collectors.counting()
                ));
        List<LeadTrendDto> trendList = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            long count = trendMap.getOrDefault(date, 0L);
            trendList.add(new LeadTrendDto(date, count));
        }
        log.info("~~> found {} trend data points", trendList.size());
        return trendList;
    }
}