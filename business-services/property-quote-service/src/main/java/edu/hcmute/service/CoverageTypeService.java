package edu.hcmute.service;

import edu.hcmute.dto.CoverageTypeDto;

import java.util.List;

public interface CoverageTypeService {
    CoverageTypeDto createCoverageType(CoverageTypeDto coverageTypeDto);

    CoverageTypeDto getCoverageTypeById(Integer id);

    List<CoverageTypeDto> getAllCoverageTypes();
}