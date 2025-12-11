package edu.hcmute.dto;

public record CoverageDto(
        Integer id,
        CoverageCode code,
        Long limit,
        Long deductible
) {
    public enum CoverageCode {
        FIRE,
        THEFT,
        NATURAL_DISASTER
    }
}