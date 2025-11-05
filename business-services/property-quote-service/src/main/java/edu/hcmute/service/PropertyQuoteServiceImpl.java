package edu.hcmute.service;

import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.repo.PropertyQuoteRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteServiceImpl implements PropertyQuoteService {
    private final PropertyQuoteRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public PropertyQuoteDto createPropertyQuote(PropertyQuoteDto propertyQuoteDto) {
        log.info("### Create PropertyQuote ###");
        log.info("PropertyQuoteDto: {}", propertyQuoteDto.toString());
        try {
            PropertyQuote propertyQuote = modelMapper.map(propertyQuoteDto, PropertyQuote.class);
            propertyQuote = repo.save(propertyQuote);
            log.info("PropertyQuote saved with id: {}", propertyQuote.getId());
            return mapModelToDto(propertyQuote);
        } catch (Exception e) {
            log.error("Error creating PropertyQuote: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public PropertyQuoteDto getPropertyQuoteById(Integer id) {
        log.info("### Get PropertyQuote by Id ###");
        log.info("PropertyQuoteDto id: {}", id);
        PropertyQuote propertyQuote = repo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No PropertyQuote found with id: {}", id);
                    return new RuntimeException("No PropertyQuote found with id: " + id);
                });
        return mapModelToDto(propertyQuote);
    }

    @Override
    public List<PropertyQuoteDto> getAllPropertyQuotes() {
        log.info("### Get All PropertyQuotes ###");
        List<PropertyQuote> propertyQuoteList = repo.findAll();
        if (propertyQuoteList.isEmpty()) {
            log.warn("No PropertyQuotes found in database");
            throw new RuntimeException("No PropertyQuotes found in database");
        }
        log.info("Found {} PropertyQuotes", propertyQuoteList.size());
        return propertyQuoteList.stream()
                .map(this::mapModelToDto)
                .toList();
    }

    private PropertyQuoteDto mapModelToDto(PropertyQuote propertyQuote) {
        return modelMapper.map(propertyQuote, PropertyQuoteDto.class);
    }
}