package edu.hcmute.bean;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserExceptionBean {
    private String message;
    private int code;
}