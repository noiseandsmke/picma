package edu.hcmute.service;

import edu.hcmute.dto.ConstructionTypeDto;

public interface ConstructionTypeService {
    ConstructionTypeDto createConstructionType(ConstructionTypeDto constructionTypeDto);

    ConstructionTypeDto getConstructionByType(String type);

    ConstructionTypeDto getConstructionById(String id);
}