package edu.hcmute.dto;

import edu.hcmute.domain.CoverageCode;

public record CoverageDto(
        Integer id,
        CoverageCode code,
        Long limit,
        Long deductible
) {
}