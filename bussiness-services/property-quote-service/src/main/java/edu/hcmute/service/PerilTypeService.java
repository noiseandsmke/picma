package edu.hcmute.service;

import edu.hcmute.dto.PerilTypeDto;

import java.util.List;

public interface PerilTypeService {
    PerilTypeDto createPerilType(PerilTypeDto perilTypeDto);

    PerilTypeDto getPerilTypeById(Integer id);

    List<PerilTypeDto> getAllPerilTypes();
}