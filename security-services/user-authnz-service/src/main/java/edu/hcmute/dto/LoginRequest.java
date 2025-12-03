package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LoginRequest(
        @JsonProperty String username,
        @JsonProperty String password
) {
}