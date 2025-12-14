package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PropertyMgmtDto(
        String id,
        LocationDto location
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LocationDto(
            String zipCode
    ) {}
    
    public String zipCode() {
        return location != null ? location.zipCode() : null;
    }
}