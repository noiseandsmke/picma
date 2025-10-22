package edu.hcmute.service;

import edu.hcmute.dto.OccupancyTypeDto;

public interface OccupancyTypeService {
    OccupancyTypeDto createOccupancyType(OccupancyTypeDto occupancyTypeDto);

    OccupancyTypeDto getOccupancyByType(String type);

    OccupancyTypeDto getOccupancyById(String id);
}