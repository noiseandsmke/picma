package edu.hcmute.beans;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Builder
@Setter
@Getter
public class UserBean implements Serializable {
    @Serial
    private static final long serialVersionUID = 8751531877435884363L;
    private String username;
    private String firstName;
    private String lastName;
    private String email;

    @Builder.Default
    private boolean emailVerified = true;
    @Builder.Default
    private boolean enabled = true;
    @Builder.Default
    private boolean totp = false;
}