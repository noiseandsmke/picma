package edu.hcmute.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serial;

@Getter
//@Builder
@AllArgsConstructor
public class UserException extends Exception {
    @Serial
    private static final long serialVersionUID = -8761721031457177925L;

    private String errorMessage;
    private int errorCode;
}