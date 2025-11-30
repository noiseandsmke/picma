package edu.hcmute.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {
    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private boolean emailVerified;
    private boolean enabled;
    private boolean totp;

    private Map<String, List<String>> attributes;
    private List<String> realmRoles;
    private List<String> clientRoles;
    private List<String> groups;
    private UserAccess access;
    private Long createdTimestamp;
}