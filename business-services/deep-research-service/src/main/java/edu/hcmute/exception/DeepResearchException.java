package edu.hcmute.exception;

public class DeepResearchException extends RuntimeException {
    public DeepResearchException(String message) {
        super(message);
    }

    public DeepResearchException(String message, Throwable cause) {
        super(message, cause);
    }
}