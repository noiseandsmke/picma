package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserInfo(
        String sub,
        @JsonProperty("preferred_username") String username,
        @JsonProperty("email_verified") Boolean emailVerified,
        String name,
        @JsonProperty("given_name") String givenName,
        @JsonProperty("family_name") String familyName,
        String email,
        String zipcode,
        @JsonProperty("realm_access") RealmAccess realmAccess
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RealmAccess(List<String> roles) {
    }
}