package edu.hcmute.exception;

import lombok.Getter;

@Getter
public class AuthException extends RuntimeException {
    private final int status;

    public AuthException(String message, int status) {
        super(message);
        this.status = status;
    }
}