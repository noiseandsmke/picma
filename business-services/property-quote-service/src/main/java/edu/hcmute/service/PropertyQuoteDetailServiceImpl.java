package edu.hcmute.service;

import edu.hcmute.dto.PropertyQuoteDetailDto;
import edu.hcmute.entity.PropertyLead;
import edu.hcmute.entity.PropertyLeadDetail;
import edu.hcmute.entity.PropertyQuoteDetail;
import edu.hcmute.event.PropertyLeadProducer;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyLeadDetailRepo;
import edu.hcmute.repo.PropertyLeadRepo;
import edu.hcmute.repo.PropertyQuoteDetailRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final PropertyLeadRepo propertyLeadRepo;
    private final PropertyLeadDetailRepo propertyLeadDetailRepo;
    private final PropertyLeadProducer leadProducer;
    private final PropertyQuoteMapper propertyQuoteMapper;

    @Override
    @Transactional
    public PropertyQuoteDetailDto createPropertyQuoteDetail(PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Create PropertyQuote ###");
        log.info("`~> propertyQuoteDetailDto: {}", propertyQuoteDetailDto.toString());
        try {
            PropertyQuoteDetail propertyQuoteDetail = propertyQuoteMapper.toEntity(propertyQuoteDetailDto);
            propertyQuoteDetail.getPropertyQuote().setCreateDate(LocalDate.now());
            propertyQuoteDetail.getPropertyQuote().setExpiryDate(LocalDate.now().plusDays(60));
            propertyQuoteDetail.getPropertyQuote().setCreatedBy("noiseandsmke");
            propertyQuoteDetail.getPropertyQuote().setModifiedBy("noiseandsmke");
            propertyQuoteDetail = propertyQuoteDetailRepo.save(propertyQuoteDetail);
            log.info("~~> propertyQuoteDetail saved with id: {}", propertyQuoteDetail.getId());

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
            propertyLeadDetail = propertyLeadDetailRepo.save(propertyLeadDetail);

            if (propertyLead.getId() > 0 && propertyLeadDetail.getId() > 0) {
                boolean isLeadSent = leadProducer.produceLead(propertyLead);
                log.info("~~> lead sent {}", isLeadSent ? "successful" : "failed");
            }
            return propertyQuoteMapper.toDto(propertyQuoteDetail);
        } catch (Exception e) {
            log.error("~~> error creating PropertyQuote: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyQuoteDetailDto getPropertyQuoteDetailById(Integer id) {
        log.info("### Get PropertyQuote by Id ###");
        log.info("~~> propertyQuoteDetailDto id: {}", id);
        PropertyQuoteDetail propertyQuoteDetail = propertyQuoteDetailRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("~~> no PropertyQuote found with id: {}", id);
                    return new RuntimeException("No PropertyQuote found with id: " + id);
                });
        return propertyQuoteMapper.toDto(propertyQuoteDetail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDetailDto> getAllPropertyQuoteDetail() {
        log.info("### Get All PropertyQuotes ###");
        List<PropertyQuoteDetail> propertyQuoteDetailList = propertyQuoteDetailRepo.findAll();
        if (propertyQuoteDetailList.isEmpty()) {
            log.warn("~~> no PropertyQuotes found in database");
            throw new RuntimeException("No PropertyQuotes found in database");
        }
        log.info("~~> found {} PropertyQuotes", propertyQuoteDetailList.size());
        return propertyQuoteDetailList.stream()
                .map(propertyQuoteMapper::toDto)
                .toList();
    }
}