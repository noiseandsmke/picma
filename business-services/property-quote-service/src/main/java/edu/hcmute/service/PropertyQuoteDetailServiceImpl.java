package edu.hcmute.service;

import edu.hcmute.dto.*;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.entity.PropertyLeadDetail;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.entity.PropertyQuoteDetail;
import edu.hcmute.event.PropertyLeadProducer;
import edu.hcmute.repo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteDetailServiceImpl implements PropertyQuoteDetailService {
    private final PropertyQuoteDetailRepo propertyQuoteDetailRepo;
    private final PropertyQuoteRepo propertyQuoteRepo;
    private final QuoteTypeRepo quoteTypeRepo;
    private final CoverageTypeRepo coverageTypeRepo;
    private final PolicyTypeRepo policyTypeRepo;
    private final PropertyLeadRepo propertyLeadRepo;
    private final PropertyLeadDetailRepo propertyLeadDetailRepo;
    private final PropertyLeadProducer leadProducer;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public PropertyQuoteDetailDto createPropertyQuoteDetail(PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Create PropertyQuote ###");
        log.info("PropertyQuoteDetailDto: {}", propertyQuoteDetailDto.toString());
        try {
            PropertyQuoteDetail propertyQuoteDetail = mapDtoToEntity(propertyQuoteDetailDto);
            propertyQuoteDetail.getPropertyQuote().setCreateDate(LocalDate.now());
            propertyQuoteDetail.getPropertyQuote().setExpiryDate(LocalDate.now().plusDays(60));
            propertyQuoteDetail.getPropertyQuote().setCreatedBy("noiseandsmke");
            propertyQuoteDetail.getPropertyQuote().setModifiedBy("noiseandsmke");
            propertyQuoteDetail = propertyQuoteDetailRepo.save(propertyQuoteDetail);
            log.info("PropertyQuoteDetail saved with id: {}", propertyQuoteDetail.getId());

            LocalDate leadExpiryDate = LocalDate.now().plusDays(30);
            if (leadExpiryDate.isAfter(propertyQuoteDetail.getPropertyQuote().getExpiryDate())) {
                leadExpiryDate = propertyQuoteDetail.getPropertyQuote().getExpiryDate();
            }

            PropertyLead propertyLead = PropertyLead.builder()
                    .userInfo(propertyQuoteDetail.getPropertyQuote().getUserInfo())
                    .propertyInfo(propertyQuoteDetail.getPropertyQuote().getPropertyInfo())
                    .status("ACTIVE")
                    .startDate(LocalDate.now())
                    .expiryDate(leadExpiryDate)
                    .build();
            propertyLead.setCreatedBy("noiseandsmke");
            propertyLead.setCreatedAt(Instant.now());
            propertyLead.setModifiedBy("noiseandsmke");
            propertyLead.setModifiedAt(Instant.now());
            propertyLead = propertyLeadRepo.save(propertyLead);

            PropertyLeadDetail propertyLeadDetail = new PropertyLeadDetail();
            propertyLeadDetail.setPropertyLead(propertyLead);
            propertyLeadDetail.setPropertyQuote(propertyQuoteDetail.getPropertyQuote());
            propertyLeadDetailRepo.save(propertyLeadDetail);

            if (propertyLead.getId() > 0 && propertyLeadDetail.getId() > 0) {
                boolean isLeadSent = leadProducer.produceLead(propertyLead);
                log.info("Lead sent {}", isLeadSent ? "successful" : "failed");
            }
            return mapEntityToDto(propertyQuoteDetail);
        } catch (Exception e) {
            log.error("Error creating PropertyQuote: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyQuoteDetailDto getPropertyQuoteDetailById(Integer id) {
        log.info("### Get PropertyQuote by Id ###");
        log.info("PropertyQuoteDetailDto id: {}", id);
        PropertyQuoteDetail propertyQuoteDetail = propertyQuoteDetailRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No PropertyQuote found with id: {}", id);
                    return new RuntimeException("No PropertyQuote found with id: " + id);
                });
        return mapEntityToDto(propertyQuoteDetail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDetailDto> getAllPropertyQuoteDetail() {
        log.info("### Get All PropertyQuotes ###");
        List<PropertyQuoteDetail> propertyQuoteDetailList = propertyQuoteDetailRepo.findAll();
        if (propertyQuoteDetailList.isEmpty()) {
            log.warn("No PropertyQuotes found in database");
            throw new RuntimeException("No PropertyQuotes found in database");
        }
        log.info("Found {} PropertyQuotes", propertyQuoteDetailList.size());
        return propertyQuoteDetailList.stream()
                .map(this::mapEntityToDto)
                .toList();
    }

    private PropertyQuoteDetailDto mapEntityToDto(PropertyQuoteDetail propertyQuoteDetail) {
        PropertyQuoteDetailDto propertyQuoteDetailDto = new PropertyQuoteDetailDto();
        propertyQuoteDetailDto.setId(propertyQuoteDetail.getId());
        if (propertyQuoteDetail.getPropertyQuote() != null) {
            propertyQuoteDetailDto.setPropertyQuoteDto(modelMapper.map(propertyQuoteDetail.getPropertyQuote(), PropertyQuoteDto.class));
        }
        if (propertyQuoteDetail.getQuoteType() != null) {
            propertyQuoteDetailDto.setQuoteTypeDto(modelMapper.map(propertyQuoteDetail.getQuoteType(), QuoteTypeDto.class));
        }
        if (propertyQuoteDetail.getCoverageType() != null) {
            propertyQuoteDetailDto.setCoverageTypeDto(modelMapper.map(propertyQuoteDetail.getCoverageType(), CoverageTypeDto.class));
        }
        if (propertyQuoteDetail.getPolicyType() != null) {
            propertyQuoteDetailDto.setPolicyTypeDto(modelMapper.map(propertyQuoteDetail.getPolicyType(), PolicyTypeDto.class));
        }
        return propertyQuoteDetailDto;
    }

    private PropertyQuoteDetail mapDtoToEntity(PropertyQuoteDetailDto propertyQuoteDetailDto) {
        PropertyQuoteDetail propertyQuoteDetail = new PropertyQuoteDetail();
        if (propertyQuoteDetailDto.getPropertyQuoteDto() != null) {
            if (propertyQuoteDetailDto.getPropertyQuoteDto().getId() != null) {
                propertyQuoteDetail.setPropertyQuote(propertyQuoteRepo.findById(propertyQuoteDetailDto
                                .getPropertyQuoteDto().getId())
                        .orElseThrow(() -> new RuntimeException("PropertyInfo not found")));
            } else {
                PropertyQuote propertyQuote = new PropertyQuote();
                propertyQuote.setUserInfo(String.valueOf(propertyQuoteDetailDto.getPropertyQuoteDto().getUserInfo()));
                propertyQuote.setPropertyInfo(String.valueOf(propertyQuoteDetailDto.getPropertyQuoteDto().getPropertyInfo()));
                propertyQuote.setCreateDate(LocalDate.now());
                propertyQuote.setExpiryDate(LocalDate.now().plusDays(30));

                propertyQuote = propertyQuoteRepo.save(propertyQuote);
                log.info("PropertyQuote saved with id: {}", propertyQuote.getId());
                propertyQuoteDetail.setPropertyQuote(propertyQuote);
            }
        }
        if (propertyQuoteDetailDto.getQuoteTypeDto() != null && propertyQuoteDetailDto.getQuoteTypeDto().getId() != null) {
            propertyQuoteDetail.setQuoteType(quoteTypeRepo.findById(propertyQuoteDetailDto.getQuoteTypeDto().getId())
                    .orElseThrow(() -> new RuntimeException("QuoteType not found")));
        }
        if (propertyQuoteDetailDto.getCoverageTypeDto() != null && propertyQuoteDetailDto.getCoverageTypeDto().getId() != null) {
            propertyQuoteDetail.setCoverageType(coverageTypeRepo.findById(propertyQuoteDetailDto.getCoverageTypeDto().getId())
                    .orElseThrow(() -> new RuntimeException("CoverageType not found")));
        }
        if (propertyQuoteDetailDto.getPolicyTypeDto() != null && propertyQuoteDetailDto.getPolicyTypeDto().getId() != null) {
            propertyQuoteDetail.setPolicyType(policyTypeRepo.findById(propertyQuoteDetailDto.getPolicyTypeDto().getId())
                    .orElseThrow(() -> new RuntimeException("PolicyType not found")));
        }
        return propertyQuoteDetail;
    }
}