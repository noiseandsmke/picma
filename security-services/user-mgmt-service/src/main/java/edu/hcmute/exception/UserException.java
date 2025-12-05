package edu.hcmute.exception;

import lombok.Getter;

@Getter
public class UserException extends RuntimeException {
    private final String errorMessage;
    private final int errorCode;

    public UserException(String errorMessage, int errorCode, Throwable cause) {
        super(errorMessage, cause);
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
    }
}