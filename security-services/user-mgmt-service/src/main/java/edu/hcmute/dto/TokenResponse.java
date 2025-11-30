package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_in") long expiresIn,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("refresh_expires_in") long refreshExpiresIn,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("not-before-policy") int notBeforePolicy,
        @JsonProperty("scope") String scope
) {
}