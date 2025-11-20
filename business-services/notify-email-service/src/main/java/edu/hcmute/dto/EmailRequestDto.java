package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class EmailRequestDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 1891249141729360289L;
    private String email;
    private String userId;
    private int id;
}