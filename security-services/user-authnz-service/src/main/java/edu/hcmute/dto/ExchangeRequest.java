package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExchangeRequest(
        @JsonProperty("code") String code,
        @JsonProperty("code_verifier") String codeVerifier,
        @JsonProperty("redirect_uri") String redirectUri
) {
}