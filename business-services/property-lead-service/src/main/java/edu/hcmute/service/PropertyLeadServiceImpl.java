package edu.hcmute.service;

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
import org.springframework.util.CollectionUtils;

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
    public PropertyLeadDto createOrUpdatePropertyLead(PropertyLeadDto propertyLeadDto) {
        return null;
    }

    @Override
    @Transactional
    public PropertyLeadDto createPropertyLeadByQuote(Integer quoteId) {
        log.info("### Creating property lead by Quote Id = {} ###", quoteId);

        try {
            List<PropertyLeadDetail> leadDetailList = propertyLeadDetailRepo.findByPropertyQuoteId(quoteId);

            if (CollectionUtils.isEmpty(leadDetailList)) {
                log.error("No PropertyLeadDetail found for quote ID: {}", quoteId);
                throw new IllegalArgumentException("Quote " + quoteId + " not found or has no associated data. Create quote first.");
            }
            log.info("Found {} PropertyLeadDetail records for quote {}", leadDetailList.size(), quoteId);

            List<PropertyLead> activeLeadList = leadDetailList.stream()
                    .map(PropertyLeadDetail::getPropertyLead)
                    .filter(Objects::nonNull)
                    .filter(propertyLead -> "ACTIVE".equalsIgnoreCase(propertyLead.getStatus()))
                    .toList();

            if (!CollectionUtils.isEmpty(activeLeadList)) {
                Integer activeLeadId = activeLeadList.get(0).getId();
                log.info("Lead already ACTIVE with Id = {}", activeLeadId);
                throw new IllegalStateException("Lead already ACTIVE with Id = " + activeLeadId);
            }

            PropertyQuote propertyQuote = leadDetailList.get(0).getPropertyQuote();

            if (propertyQuote == null) {
                log.error("PropertyQuote is NULL for leadDetail. Database integrity issue - foreign key points to non-existent record!");
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
            log.info("Saved new PropertyLeadDetail");

            log.info("Successfully created lead with Id = {}", propertyLead.getId());
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
    public List<PropertyLeadDto> findAllPropertyLeads() {
        return List.of();
    }

    @Override
    public List<PropertyLeadDto> findPropertyLeadsByStatus(String status) {
        return List.of();
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
    public PropertyLeadDto deletePropertyLeadById(Integer leadId) {
        return null;
    }
}