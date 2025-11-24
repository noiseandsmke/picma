package edu.hcmute.dto;

import java.util.List;

public record CoverageTypeDto(
        Integer id,
        String type,
        List<PerilTypeDto> perilTypeList
) {
}