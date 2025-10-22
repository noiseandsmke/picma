package edu.hcmute.service;

import edu.hcmute.dto.OccupancyTypeDto;
import edu.hcmute.model.OccupancyType;
import edu.hcmute.repo.OccupancyTypeRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@AllArgsConstructor
@Slf4j
public class OccupancyTypeServiceImpl implements OccupancyTypeService {
    private OccupancyTypeRepo occupancyTypeRepo;
    private ModelMapper modelMapper;

    @Override
    public OccupancyTypeDto createOccupancyType(OccupancyTypeDto occupancyTypeDto) {
        OccupancyType occupancyType = modelMapper.map(occupancyTypeDto, OccupancyType.class);
        try {
            occupancyType = occupancyTypeRepo.save(occupancyType);
            if (StringUtils.hasText(occupancyType.getId())) {
                log.info("Create OccupancyType id: {}", occupancyType.getId());
            } else {
                throw new RuntimeException("Something went wrong while creating occupancy type");
            }
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
        return modelMapper.map(occupancyType, OccupancyTypeDto.class);
    }

    @Override
    public OccupancyTypeDto getOccupancyByType(String type) {
        log.info("Getting OccupancyType by type: {}", type);
        OccupancyType occupancyTypeFetched = occupancyTypeRepo.fetchOccupancyByType(type).stream().findFirst().orElse(null);
        return modelMapper.map(occupancyTypeFetched, OccupancyTypeDto.class);
    }

    @Override
    public OccupancyTypeDto getOccupancyById(String id) {
        log.info("Getting OccupancyType by id: {}", id);
        return modelMapper.map(occupancyTypeRepo.findById(id).orElse(null), OccupancyTypeDto.class);
    }
}