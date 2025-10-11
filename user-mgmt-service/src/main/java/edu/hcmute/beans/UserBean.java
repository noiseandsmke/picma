package edu.hcmute.beans;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@NoArgsConstructor
@Setter
@Getter
@ToString
@AllArgsConstructor
public class UserBean implements Serializable {
    @Serial
    private static final long serialVersionUID = 8751531877435884363L;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String groupId;
    private String id;
    //    @Builder.Default
    private boolean emailVerified = true;
    //    @Builder.Default
    private boolean enabled = true;
    //    @Builder.Default
    private boolean totp = false;
}