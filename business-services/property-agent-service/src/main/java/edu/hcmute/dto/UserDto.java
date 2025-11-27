package edu.hcmute.dto;

public record UserDto(
        String id,
        String fullName,
        String email,
        String zipCode
) {
}