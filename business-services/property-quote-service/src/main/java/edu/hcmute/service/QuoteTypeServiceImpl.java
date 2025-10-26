package edu.hcmute.service;

import edu.hcmute.dto.QuoteTypeDto;
import edu.hcmute.entity.QuoteType;
import edu.hcmute.repo.QuoteTypeRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuoteTypeServiceImpl implements QuoteTypeService {
    private final QuoteTypeRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public QuoteTypeDto createQuoteType(QuoteTypeDto quoteTypeDto) {
        log.info("### Create QuoteType ###");
        log.info("QuoteTypeDto: {}", quoteTypeDto.toString());
        try {
            QuoteType quoteType = modelMapper.map(quoteTypeDto, QuoteType.class);
            quoteType = repo.save(quoteType);
            log.info("QuoteType saved with id: {}", quoteType.getId());
            return mapModelToDto(quoteType);
        } catch (Exception e) {
            log.error("Error creating QuoteType: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public QuoteTypeDto getQuoteTypeById(Integer id) {
        log.info("### Get QuoteType by Id ###");
        log.info("QuoteTypeDto id: {}", id);
        QuoteType quoteType = repo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No QuoteType found with id: {}", id);
                    return new RuntimeException("No QuoteType found with id: " + id);
                });
        return mapModelToDto(quoteType);
    }

    @Override
    public List<QuoteTypeDto> getAllQuoteTypes() {
        log.info("### Get All QuoteTypes ###");
        List<QuoteType> quoteTypeList = repo.findAll();
        if (quoteTypeList.isEmpty()) {
            log.warn("No QuoteTypes found in database");
            throw new RuntimeException("No QuoteTypes found in database");
        }
        log.info("Found {} QuoteTypes", quoteTypeList.size());
        return quoteTypeList.stream()
                .map(this::mapModelToDto)
                .toList();
    }

    private QuoteTypeDto mapModelToDto(QuoteType quoteType) {
        return modelMapper.map(quoteType, QuoteTypeDto.class);
    }
}