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
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.util.List;

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
    public PropertyLeadDto createPropertyLeadByQuote(Integer quoteId) {
        try {
            log.info("### Creating property lead by Quote Id = {} ###", quoteId);
            List<PropertyLeadDetail> leadDetailList = propertyLeadDetailRepo.findByPropertyQuoteId(quoteId);
            if (!CollectionUtils.isEmpty(leadDetailList)) {
                List<PropertyLead> leadList = leadDetailList.stream()
                        .map(PropertyLeadDetail::getPropertyLead)
                        .filter(propertyLead -> propertyLead.getStatus().equalsIgnoreCase("ACTIVE"))
                        .toList();
                if (CollectionUtils.isEmpty(leadList)) {
                    PropertyQuote propertyQuote = leadDetailList.get(0).getPropertyQuote();
                    PropertyLead propertyLead = PropertyLead.builder()
                            .userInfo(propertyQuote.getUserInfo())
                            .propertyInfo(propertyQuote.getPropertyInfo())
                            .status("ACTIVE").build();
                    propertyLead.setCreatedAt(Instant.now());
                    propertyLead.setCreatedBy("noiseandsmke");
                    propertyLeadRepo.save(propertyLead);
                    PropertyLeadDetail propertyLeadDetail = new PropertyLeadDetail();
                    propertyLeadDetail.setPropertyLead(propertyLead);
                    propertyLeadDetail.setPropertyQuote(propertyQuote);
                    propertyLeadDetailRepo.save(propertyLeadDetail);
                    return modelMapper.map(propertyLead, PropertyLeadDto.class);
                } else {
                    log.info("Lead already ACTIVE with Id = {}", leadList.get(0).getId());
                    throw new RuntimeException("Lead already ACTIVE with Id = " + leadList.get(0).getId());
                }
            } else {
                throw new RuntimeException("BUG :: No lead found for quote");
            }
        } catch (Exception e) {
            log.error(e.getLocalizedMessage());
            throw new RuntimeException(e.getLocalizedMessage());
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