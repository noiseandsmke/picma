package edu.hcmute.service;

import edu.hcmute.dto.*;
import edu.hcmute.entity.PropertyInfo;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.repo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteServiceImpl implements PropertyQuoteService {
    private final PropertyQuoteRepo propertyQuoteRepo;
    private final PropertyInfoRepo propertyInfoRepo;
    private final QuoteTypeRepo quoteTypeRepo;
    private final CoverageTypeRepo coverageTypeRepo;
    private final PolicyTypeRepo policyTypeRepo;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public PropertyQuoteDto createPropertyQuote(PropertyQuoteDto propertyQuoteDto) {
        log.info("### Create PropertyQuote ###");
        log.info("PropertyQuoteDto: {}", propertyQuoteDto.toString());
        try {
            PropertyQuote propertyQuote = mapDtoToEntity(propertyQuoteDto);
            propertyQuote = propertyQuoteRepo.save(propertyQuote);
            log.info("PropertyQuote saved with id: {}", propertyQuote.getId());
            return mapEntityToDto(propertyQuote);
        } catch (Exception e) {
            log.error("Error creating PropertyQuote: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyQuoteDto getPropertyQuoteById(Integer id) {
        log.info("### Get PropertyQuote by Id ###");
        log.info("PropertyQuoteDto id: {}", id);
        PropertyQuote propertyQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No PropertyQuote found with id: {}", id);
                    return new RuntimeException("No PropertyQuote found with id: " + id);
                });
        return mapEntityToDto(propertyQuote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getAllPropertyQuotes() {
        log.info("### Get All PropertyQuotes ###");
        List<PropertyQuote> propertyQuoteList = propertyQuoteRepo.findAll();
        if (propertyQuoteList.isEmpty()) {
            log.warn("No PropertyQuotes found in database");
            throw new RuntimeException("No PropertyQuotes found in database");
        }
        log.info("Found {} PropertyQuotes", propertyQuoteList.size());
        return propertyQuoteList.stream()
                .map(this::mapEntityToDto)
                .toList();
    }

    private PropertyQuoteDto mapEntityToDto(PropertyQuote propertyQuote) {
        PropertyQuoteDto propertyQuoteDto = new PropertyQuoteDto();
        propertyQuoteDto.setId(propertyQuote.getId());
        if (propertyQuote.getPropertyInfo() != null) {
            propertyQuoteDto.setPropertyInfoDto(modelMapper.map(propertyQuote.getPropertyInfo(), PropertyInfoDto.class));
        }
        if (propertyQuote.getQuoteType() != null) {
            propertyQuoteDto.setQuoteTypeDto(modelMapper.map(propertyQuote.getQuoteType(), QuoteTypeDto.class));
        }
        if (propertyQuote.getCoverageType() != null) {
            propertyQuoteDto.setCoverageTypeDto(modelMapper.map(propertyQuote.getCoverageType(), CoverageTypeDto.class));
        }
        if (propertyQuote.getPolicyType() != null) {
            propertyQuoteDto.setPolicyTypeDto(modelMapper.map(propertyQuote.getPolicyType(), PolicyTypeDto.class));
        }
        return propertyQuoteDto;
    }

    private PropertyQuote mapDtoToEntity(PropertyQuoteDto propertyQuoteDto) {
        PropertyQuote propertyQuote = new PropertyQuote();
        if (propertyQuoteDto.getPropertyInfoDto() != null) {
            if (propertyQuoteDto.getPropertyInfoDto().getId() != null) {
                propertyQuote.setPropertyInfo(propertyInfoRepo.findById(propertyQuoteDto.getPropertyInfoDto().getId())
                        .orElseThrow(() -> new RuntimeException("PropertyInfo not found")));
            } else {
                PropertyInfo propertyInfo = modelMapper.map(propertyQuoteDto.getPropertyInfoDto(), PropertyInfo.class);
                propertyInfo = propertyInfoRepo.save(propertyInfo);
                propertyQuote.setPropertyInfo(propertyInfo);
            }
        }
        if (propertyQuoteDto.getQuoteTypeDto() != null && propertyQuoteDto.getQuoteTypeDto().getId() != null) {
            propertyQuote.setQuoteType(quoteTypeRepo.findById(propertyQuoteDto.getQuoteTypeDto().getId())
                    .orElseThrow(() -> new RuntimeException("QuoteType not found")));
        }
        if (propertyQuoteDto.getCoverageTypeDto() != null && propertyQuoteDto.getCoverageTypeDto().getId() != null) {
            propertyQuote.setCoverageType(coverageTypeRepo.findById(propertyQuoteDto.getCoverageTypeDto().getId())
                    .orElseThrow(() -> new RuntimeException("CoverageType not found")));
        }
        if (propertyQuoteDto.getPolicyTypeDto() != null && propertyQuoteDto.getPolicyTypeDto().getId() != null) {
            propertyQuote.setPolicyType(policyTypeRepo.findById(propertyQuoteDto.getPolicyTypeDto().getId())
                    .orElseThrow(() -> new RuntimeException("PolicyType not found")));
        }
        return propertyQuote;
    }
}