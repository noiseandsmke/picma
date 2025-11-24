package edu.hcmute.dto;

public record UserExceptionDto(
        String message,
        int code
) {
}