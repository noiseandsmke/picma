package edu.hcmute.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serial;

@Getter
@AllArgsConstructor
public class UserRestException extends Exception {
    @Serial
    private static final long serialVersionUID = -8761721031457177925L;
    private Throwable cause;
}