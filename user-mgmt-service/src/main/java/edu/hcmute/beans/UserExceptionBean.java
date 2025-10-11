package edu.hcmute.beans;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserExceptionBean {
    private String message;
    private int code;
}