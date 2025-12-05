package edu.hcmute.exception;

public class PropertyLeadException extends RuntimeException {
    public PropertyLeadException(String message) {
        super(message);
    }

    public PropertyLeadException(String message, Throwable cause) {
        super(message, cause);
    }
}