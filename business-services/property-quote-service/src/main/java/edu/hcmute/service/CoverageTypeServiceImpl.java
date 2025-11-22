package edu.hcmute.service;

import edu.hcmute.dto.CoverageTypeDto;
import edu.hcmute.dto.PerilTypeDto;
import edu.hcmute.entity.CoverageType;
import edu.hcmute.entity.PerilType;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.CoverageTypeRepo;
import edu.hcmute.repo.PerilTypeRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CoverageTypeServiceImpl implements CoverageTypeService {
    private final CoverageTypeRepo coverageTypeRepo;
    private final PerilTypeRepo perilTypeRepo;
    private final PropertyQuoteMapper propertyQuoteMapper;

    @Override
    @Transactional
    public CoverageTypeDto createCoverageType(CoverageTypeDto coverageTypeDto) {
        log.info("### Create CoverageType ###");
        log.info("CoverageTypeDto: {}", coverageTypeDto.getType());
        try {
            CoverageType coverageType = propertyQuoteMapper.toEntity(coverageTypeDto);
            if (!CollectionUtils.isEmpty(coverageTypeDto.getPerilTypeList())) {
                List<Integer> perilTypeIds = coverageTypeDto.getPerilTypeList().stream()
                        .map(PerilTypeDto::getId)
                        .toList();
                List<PerilType> perilTypes = perilTypeRepo.findAllById(perilTypeIds);
                if (perilTypes.size() != perilTypeIds.size()) {
                    throw new RuntimeException("Some PerilTypes not found");
                }
                coverageType.setPerilTypeList(perilTypes);
            }
            coverageType = coverageTypeRepo.save(coverageType);
            log.info("CoverageType saved with id: {}", coverageType.getId());
            return mapModelToDto(coverageType);
        } catch (Exception e) {
            log.error("Error creating CoverageType: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public CoverageTypeDto getCoverageTypeById(Integer id) {
        log.info("### Get CoverageType by Id ###");
        log.info("CoverageTypeDto id: {}", id);
        CoverageType coverageType = coverageTypeRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No CoverageType found with id: {}", id);
                    return new RuntimeException("No CoverageType found with id: " + id);
                });
        return mapModelToDto(coverageType);
    }

    @Override
    public List<CoverageTypeDto> getAllCoverageTypes() {
        log.info("### Get All CoverageTypes ###");
        List<CoverageType> coverageTypeList = coverageTypeRepo.findAll();
        if (coverageTypeList.isEmpty()) {
            log.warn("No CoverageTypes found in database");
            throw new RuntimeException("No CoverageTypes found in database");
        }
        log.info("Found {} CoverageTypes", coverageTypeList.size());
        return coverageTypeList.stream()
                .map(this::mapModelToDto)
                .toList();
    }

    private CoverageTypeDto mapModelToDto(CoverageType coverageType) {
        return propertyQuoteMapper.toDto(coverageType);
    }
}