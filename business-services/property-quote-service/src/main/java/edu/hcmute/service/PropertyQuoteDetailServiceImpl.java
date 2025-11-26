package edu.hcmute.service;

import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.dto.LeadInfoDto;
import edu.hcmute.dto.PropertyQuoteDetailDto;
import edu.hcmute.entity.PropertyQuoteDetail;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteDetailRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteDetailServiceImpl implements PropertyQuoteDetailService {
    private final PropertyQuoteDetailRepo propertyQuoteDetailRepo;
    private final PropertyLeadFeignClient propertyLeadFeignClient;
    private final PropertyQuoteMapper propertyQuoteMapper;

    @Override
    @Transactional
    public PropertyQuoteDetailDto createPropertyQuoteDetail(PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Create PropertyQuote for leadId = {} ###", propertyQuoteDetailDto.leadId());

        Integer leadId = propertyQuoteDetailDto.leadId();
        if (leadId == null) {
            throw new IllegalArgumentException("leadId is required to create a quote");
        }

        LeadInfoDto leadInfo;
        try {
            leadInfo = propertyLeadFeignClient.getLeadById(leadId);
            log.info("~~> validated lead exists: id={}, user={}", leadInfo.id(), leadInfo.userInfo());
        } catch (Exception e) {
            log.error("~~> lead not found with id: {}", leadId);
            throw new RuntimeException("Lead not found with id: " + leadId + ". Create a lead first.");
        }

        try {
            PropertyQuoteDetail propertyQuoteDetail = propertyQuoteMapper.toEntity(propertyQuoteDetailDto);
            propertyQuoteDetail.getPropertyQuote().setLeadId(leadId);
            propertyQuoteDetail = propertyQuoteDetailRepo.save(propertyQuoteDetail);
            log.info("~~> propertyQuoteDetail saved with id: {}", propertyQuoteDetail.getId());

            PropertyQuoteDetailDto resultDto = propertyQuoteMapper.toDto(propertyQuoteDetail);
            return enrichWithLeadInfo(resultDto, leadInfo);
        } catch (Exception e) {
            log.error("~~> error creating PropertyQuote: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyQuoteDetailDto getPropertyQuoteDetailById(Integer id) {
        log.info("### Get PropertyQuote by Id = {} ###", id);
        PropertyQuoteDetail propertyQuoteDetail = propertyQuoteDetailRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("~~> no PropertyQuote found with id: {}", id);
                    return new RuntimeException("No PropertyQuote found with id: " + id);
                });

        PropertyQuoteDetailDto dto = propertyQuoteMapper.toDto(propertyQuoteDetail);
        return enrichWithLeadInfo(dto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDetailDto> getAllPropertyQuoteDetail(String sort, String order) {
        log.info("### Get All PropertyQuotes ###");
        Sort.Direction direction = Sort.Direction.fromString(order);
        Sort sortBy = Sort.by(direction, sort);
        List<PropertyQuoteDetail> propertyQuoteDetailList = propertyQuoteDetailRepo.findAll(sortBy);
        if (propertyQuoteDetailList.isEmpty()) {
            log.warn("~~> no PropertyQuotes found in database");
            return List.of();
        }
        log.info("~~> found {} PropertyQuotes", propertyQuoteDetailList.size());
        return propertyQuoteDetailList.stream()
                .map(propertyQuoteMapper::toDto)
                .map(this::enrichWithLeadInfo)
                .toList();
    }

    @Override
    @Transactional
    public PropertyQuoteDetailDto updatePropertyQuoteDetail(Integer id, PropertyQuoteDetailDto propertyQuoteDetailDto) {
        log.info("### Update PropertyQuote by Id = {} ###", id);
        PropertyQuoteDetail existingQuoteDetail = propertyQuoteDetailRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("No PropertyQuote found with id: " + id));

        PropertyQuoteDetail updatedQuoteDetail = propertyQuoteMapper.toEntity(propertyQuoteDetailDto);
        updatedQuoteDetail.setId(existingQuoteDetail.getId());
        updatedQuoteDetail.getPropertyQuote().setId(existingQuoteDetail.getPropertyQuote().getId());
        updatedQuoteDetail.getPropertyQuote().setLeadId(existingQuoteDetail.getPropertyQuote().getLeadId());

        updatedQuoteDetail = propertyQuoteDetailRepo.save(updatedQuoteDetail);
        PropertyQuoteDetailDto dto = propertyQuoteMapper.toDto(updatedQuoteDetail);
        return enrichWithLeadInfo(dto);
    }

    @Override
    @Transactional
    public void deletePropertyQuoteDetailById(Integer id) {
        log.info("### Delete PropertyQuote by Id = {} ###", id);
        if (!propertyQuoteDetailRepo.existsById(id)) {
            throw new RuntimeException("No PropertyQuote found with id: " + id);
        }
        propertyQuoteDetailRepo.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDetailDto> getQuotesByLeadId(Integer leadId) {
        log.info("### Get PropertyQuotes by leadId = {} ###", leadId);
        List<PropertyQuoteDetail> quotes = propertyQuoteDetailRepo.findByPropertyQuoteLeadId(leadId);
        return quotes.stream()
                .map(propertyQuoteMapper::toDto)
                .map(this::enrichWithLeadInfo)
                .toList();
    }

    private PropertyQuoteDetailDto enrichWithLeadInfo(PropertyQuoteDetailDto dto) {
        if (dto.leadId() == null) return dto;
        try {
            LeadInfoDto leadInfo = propertyLeadFeignClient.getLeadById(dto.leadId());
            return enrichWithLeadInfo(dto, leadInfo);
        } catch (Exception e) {
            log.warn("~~> could not fetch lead info for leadId: {}", dto.leadId());
            return dto;
        }
    }

    private PropertyQuoteDetailDto enrichWithLeadInfo(PropertyQuoteDetailDto dto, LeadInfoDto leadInfo) {
        return new PropertyQuoteDetailDto(
                dto.id(),
                dto.leadId(),
                dto.propertyQuoteDto(),
                dto.quoteTypeDto(),
                dto.coverageTypeDto(),
                dto.policyTypeDto(),
                leadInfo
        );
    }
}
