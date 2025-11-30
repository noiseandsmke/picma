package edu.hcmute.dto;

import jakarta.validation.constraints.NotEmpty;

public record UserActionDto(
        @NotEmpty
        String userId
) {
}