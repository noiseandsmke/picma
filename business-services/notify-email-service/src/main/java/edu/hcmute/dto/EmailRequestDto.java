package edu.hcmute.dto;

public record EmailRequestDto(
        String email,
        String userId,
        int id
) {
}