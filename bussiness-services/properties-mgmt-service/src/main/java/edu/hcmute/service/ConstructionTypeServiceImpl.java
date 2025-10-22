package edu.hcmute.service;

import edu.hcmute.dto.ConstructionTypeDto;
import edu.hcmute.model.ConstructionType;
import edu.hcmute.repo.ConstructionTypeRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@AllArgsConstructor
@Slf4j
public class ConstructionTypeServiceImpl implements ConstructionTypeService {
    private ConstructionTypeRepo constructionTypeRepo;
    private ModelMapper modelMapper;

    @Override
    public ConstructionTypeDto createConstructionType(ConstructionTypeDto constructionTypeDto) {
        ConstructionType constructionType = modelMapper.map(constructionTypeDto, ConstructionType.class);
        try {
            constructionType = constructionTypeRepo.save(constructionType);
            if (StringUtils.hasText(constructionType.getId())) {
                log.info("Create ConstructionType id: {}", constructionType.getId());
            } else {
                throw new RuntimeException("Something went wrong while creating construction type");
            }
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
        return modelMapper.map(constructionType, ConstructionTypeDto.class);
    }

    @Override
    public ConstructionTypeDto getConstructionByType(String type) {
        log.info("Getting ConstructionType by type: {}", type);
        ConstructionType constructionTypeFetched = constructionTypeRepo.fetchConstructionByType(type).stream().findFirst().orElse(null);
        return modelMapper.map(constructionTypeFetched, ConstructionTypeDto.class);
    }

    @Override
    public ConstructionTypeDto getConstructionById(String id) {
        log.info("Getting ConstructionType by id: {}", id);
        return modelMapper.map(constructionTypeRepo.findById(id).orElse(null), ConstructionTypeDto.class);
    }
}