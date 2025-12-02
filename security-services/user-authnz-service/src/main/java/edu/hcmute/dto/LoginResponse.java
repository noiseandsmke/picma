package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record LoginResponse(
        @JsonProperty String accessToken,
        @JsonProperty String refreshToken,
        @JsonProperty Long expiresIn,
        @JsonProperty Long refreshExpiresIn,
        @JsonProperty String tokenType,
        @JsonProperty String idToken,
        @JsonProperty UserData user
) {
    public record UserData(
            String id,
            String username,
            String email,
            String name,
            List<String> roles
    ) {
    }
}