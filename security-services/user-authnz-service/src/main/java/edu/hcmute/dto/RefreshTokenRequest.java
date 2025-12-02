package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RefreshTokenRequest(
        @JsonProperty String refreshToken
) {
}