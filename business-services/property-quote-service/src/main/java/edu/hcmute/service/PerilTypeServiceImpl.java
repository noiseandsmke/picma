package edu.hcmute.service;

import edu.hcmute.dto.PerilTypeDto;
import edu.hcmute.entity.PerilType;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PerilTypeRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PerilTypeServiceImpl implements PerilTypeService {
    private final PerilTypeRepo repo;
    private final PropertyQuoteMapper propertyQuoteMapper;

    @Override
    public PerilTypeDto createPerilType(PerilTypeDto perilTypeDto) {
        log.info("### Create PerilType ###");
        log.info("PerilTypeDto: {}", perilTypeDto.toString());
        try {
            PerilType perilType = propertyQuoteMapper.toEntity(perilTypeDto);
            perilType = repo.save(perilType);
            log.info("PerilType saved with id: {}", perilType.getId());
            return mapModelToDto(perilType);
        } catch (Exception e) {
            log.error("Error creating PerilType: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public PerilTypeDto getPerilTypeById(Integer id) {
        log.info("### Get PerilType by Id ###");
        log.info("PerilTypeDto id: {}", id);
        PerilType perilType = repo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No PerilType found with id: {}", id);
                    return new RuntimeException("No PerilType found with id: " + id);
                });
        return mapModelToDto(perilType);
    }

    @Override
    public List<PerilTypeDto> getAllPerilTypes() {
        log.info("### Get All PerilTypes ###");
        List<PerilType> perilTypeList = repo.findAll();
        if (perilTypeList.isEmpty()) {
            log.warn("No PerilTypes found in database");
            throw new RuntimeException("No PerilTypes found in database");
        }
        log.info("Found {} PerilTypes", perilTypeList.size());
        return perilTypeList.stream()
                .map(this::mapModelToDto)
                .toList();
    }

    private PerilTypeDto mapModelToDto(PerilType perilType) {
        return propertyQuoteMapper.toDto(perilType);
    }
}