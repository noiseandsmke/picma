package edu.hcmute.beans;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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

    @NotEmpty(message = "{username.notEmpty.message}")
    @Size(min = 3, max = 255, message = "{username.size.message}")
    private String username;

    @NotEmpty(message = "{firstName.notEmpty.message}")
    @Size(max = 255, message = "{firstName.size.message}")
    private String firstName;

    @NotEmpty(message = "{lastName.notEmpty.message}")
    @Size(max = 255, message = "{lastName.size.message}")
    private String lastName;

    @NotEmpty(message = "{email.notEmpty.message}")
    @Size(max = 255, message = "{email.size.message}")
    @Pattern(regexp = "^[\\w-\\\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", message = "{email.pattern.message}")
    private String email;

    @NotEmpty(message = "{mobile.notEmpty.message}")
    @Pattern(regexp = "^[+]*[(]?[0-9]{1,4}[)]?[-\\s\\\\./0-9]*$", message = "{mobile.pattern.message}")
    private String mobile;

    private String groupId;
    private String id;
    //    @Builder.Default
    private boolean emailVerified = true;
    //    @Builder.Default
    private boolean enabled = true;
    //    @Builder.Default
    private boolean totp = false;
}