package edu.hcmute.service;

import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.dto.LeadInfoDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteServiceImpl implements PropertyQuoteService {
    private final PropertyQuoteRepo propertyQuoteRepo;
    private final PropertyQuoteMapper propertyQuoteMapper;
    private final PropertyLeadFeignClient propertyLeadFeignClient;

    @Override
    @Transactional
    public PropertyQuoteDto createPropertyQuote(PropertyQuoteDto propertyQuoteDto) {
        log.info("### Create PropertyQuote for leadId = {} ###", propertyQuoteDto.leadId());

        Integer leadId = propertyQuoteDto.leadId();
        if (leadId == null) {
            throw new IllegalArgumentException("leadId is required to create a quote");
        }

        try {
            LeadInfoDto leadInfo = propertyLeadFeignClient.getLeadById(leadId);
            log.info("~~> validated lead exists: id={}, user={}", leadInfo.id(), leadInfo.userInfo());
        } catch (Exception e) {
            log.error("~~> lead not found with id: {}", leadId);
            throw new RuntimeException("Lead not found with id: " + leadId);
        }

        try {
            PropertyQuote propertyQuote = propertyQuoteMapper.toEntity(propertyQuoteDto);
            propertyQuote.setLeadId(leadId);

            if (propertyQuote.getValidUntil() == null) {
                propertyQuote.setValidUntil(LocalDate.now().plusDays(30));
            }

            propertyQuote = propertyQuoteRepo.save(propertyQuote);
            log.info("~~> PropertyQuote saved with id: {}", propertyQuote.getId());

            return propertyQuoteMapper.toDto(propertyQuote);
        } catch (Exception e) {
            log.error("~~> error creating PropertyQuote: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create PropertyQuote: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyQuoteDto getPropertyQuoteById(Integer id) {
        log.info("### Get PropertyQuote by id = {} ###", id);
        PropertyQuote propertyQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("PropertyQuote not found with id: " + id));
        return propertyQuoteMapper.toDto(propertyQuote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getAllPropertyQuotes(String sort, String order) {
        log.info("### Get All PropertyQuotes ###");
        Sort.Direction direction = Sort.Direction.fromString(order);
        Sort sortBy = Sort.by(direction, sort);
        List<PropertyQuote> quotes = propertyQuoteRepo.findAll(sortBy);
        log.info("~~> found {} PropertyQuotes", quotes.size());
        return quotes.stream().map(propertyQuoteMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getQuotesByLeadId(Integer leadId) {
        log.info("### Get PropertyQuotes by leadId = {} ###", leadId);
        List<PropertyQuote> quotes = propertyQuoteRepo.findByLeadId(leadId);
        log.info("~~> found {} quotes for leadId: {}", quotes.size(), leadId);
        return quotes.stream().map(propertyQuoteMapper::toDto).toList();
    }

    @Override
    @Transactional
    public PropertyQuoteDto updatePropertyQuote(Integer id, PropertyQuoteDto propertyQuoteDto) {
        log.info("### Update PropertyQuote by id = {} ###", id);
        PropertyQuote existingQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("PropertyQuote not found with id: " + id));

        PropertyQuote updatedQuote = propertyQuoteMapper.toEntity(propertyQuoteDto);
        updatedQuote.setId(existingQuote.getId());
        updatedQuote.setLeadId(existingQuote.getLeadId());

        updatedQuote = propertyQuoteRepo.save(updatedQuote);
        log.info("~~> PropertyQuote updated with id: {}", updatedQuote.getId());

        return propertyQuoteMapper.toDto(updatedQuote);
    }

    @Override
    @Transactional
    public void deletePropertyQuoteById(Integer id) {
        log.info("### Delete PropertyQuote by id = {} ###", id);
        if (!propertyQuoteRepo.existsById(id)) {
            throw new RuntimeException("PropertyQuote not found with id: " + id);
        }
        propertyQuoteRepo.deleteById(id);
        log.info("~~> PropertyQuote deleted with id: {}", id);
    }
}
