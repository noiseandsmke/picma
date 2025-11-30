package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record IntrospectResponse(
        @JsonProperty("active") Boolean active,
        @JsonProperty("scope") String scope,
        @JsonProperty("client_id") String clientId,
        @JsonProperty("username") String username
) {
}