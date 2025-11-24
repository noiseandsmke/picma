package edu.hcmute.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserDto(
        @NotEmpty(message = "{username.notEmpty.message}")
        @Size(min = 3, max = 255, message = "{username.size.message}")
        String username,

        @NotEmpty(message = "{firstName.notEmpty.message}")
        @Size(max = 255, message = "{firstName.size.message}")
        String firstName,

        @NotEmpty(message = "{lastName.notEmpty.message}")
        @Size(max = 255, message = "{lastName.size.message}")
        String lastName,

        @NotEmpty(message = "{email.notEmpty.message}")
        @Size(max = 255, message = "{email.size.message}")
        @Pattern(regexp = "^[\\w-\\\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
        String email,

        @NotEmpty(message = "{mobile.notEmpty.message}")
        @Pattern(regexp = "^[+]*[(]?[0-9]{1,4}[)]?[-\\s\\\\./0-9]*$")
        String mobile,

        String groupId,
        String id,
        boolean emailVerified,
        boolean enabled,
        boolean totp
) {
    public UserDto {
        emailVerified = true;
        enabled = true;
        totp = false;
    }
}