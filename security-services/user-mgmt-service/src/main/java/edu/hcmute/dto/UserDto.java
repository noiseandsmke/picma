package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserDto(
        String id,

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

        boolean emailVerified,

        String zipcode,

        String group,

        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        String password
) {
}