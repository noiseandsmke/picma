package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        @JsonProperty String username,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        @JsonProperty String password,

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        @JsonProperty String email,

        @NotBlank(message = "First name is required")
        @JsonProperty String firstName,

        @NotBlank(message = "Last name is required")
        @JsonProperty String lastName,
        
        @JsonProperty String zipcode
) {
}