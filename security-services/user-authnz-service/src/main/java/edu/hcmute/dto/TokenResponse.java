package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_in") Long expiresIn,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("id_token") String idToken,
        @JsonProperty("not-before-policy") Integer notBeforePolicy,
        @JsonProperty("session_state") String sessionState,
        @JsonProperty("scope") String scope
) {
}