package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record User(
        String id,
        String username,
        String firstName,
        String lastName,
        String email,
        boolean emailVerified,
        boolean enabled,
        boolean totp,
        Map<String, List<String>> attributes,
        List<String> realmRoles,
        List<String> clientRoles,
        List<String> groups,
        UserAccess access,
        Long createdTimestamp,
        List<CredentialRepresentation> credentials
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CredentialRepresentation(
            String type,
            String value,
            boolean temporary
    ) {
    }
}