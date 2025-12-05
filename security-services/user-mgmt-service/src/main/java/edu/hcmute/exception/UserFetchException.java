package edu.hcmute.exception;

public class UserFetchException extends RuntimeException {
    public UserFetchException(String message, Throwable cause) {
        super(message, cause);
    }
}