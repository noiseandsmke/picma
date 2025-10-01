package edu.hcmute.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
@Builder
public class User implements Serializable {
    @Serial
    private static final long serialVersionUID = 227473858807438466L;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    @JsonIgnore
    private String groupId;
    @JsonIgnore
    private String userId;
    @Builder.Default
    private boolean emailVerified = true;
    @Builder.Default
    private boolean enabled = true;
    @Builder.Default
    private boolean totp = false;
    private List<String> realmRoles;
    private UserAccess access;
}