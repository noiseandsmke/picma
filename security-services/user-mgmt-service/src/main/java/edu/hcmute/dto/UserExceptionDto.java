package edu.hcmute.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserExceptionDto {
    private String message;
    private int code;
}