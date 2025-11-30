package edu.hcmute.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserDto(
        @NotEmpty
        @Size(min = 3, max = 255)
        String username,

        @NotEmpty
        @Size(max = 255)
        String firstName,

        @NotEmpty
        @Size(max = 255)
        String lastName,

        @NotEmpty
        @Size(max = 255)
        @Pattern(regexp = "^[\\w-\\\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
        String email,

        @NotEmpty
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