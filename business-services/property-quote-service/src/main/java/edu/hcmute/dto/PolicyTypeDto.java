package edu.hcmute.dto;

public record PolicyTypeDto(
        Integer id,
        String type,
        CoverageTypeDto coverageTypeDto
) {
}