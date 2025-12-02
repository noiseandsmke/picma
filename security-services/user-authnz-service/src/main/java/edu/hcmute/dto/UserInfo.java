package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record UserInfo(
        String sub,
        @JsonProperty("preferred_username") String username,
        @JsonProperty("email_verified") Boolean emailVerified,
        String name,
        @JsonProperty("given_name") String givenName,
        @JsonProperty("family_name") String familyName,
        String email,
        @JsonProperty("realm_access") RealmAccess realmAccess
) {
    public record RealmAccess(List<String> roles) {
    }
}