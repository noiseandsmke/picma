package edu.hcmute.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
public class User implements Serializable {
    @Serial
    private static final long serialVersionUID = 227473858807438466L;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    @JsonIgnore
    private String groupId;
    private String id;
    private boolean emailVerified = true;
    private boolean enabled = true;
    private boolean totp = false;
    private List<String> realmRoles;
    private UserAccess access;
}