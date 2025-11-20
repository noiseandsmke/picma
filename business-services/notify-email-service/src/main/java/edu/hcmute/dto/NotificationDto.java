package edu.hcmute.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class NotificationDto implements Serializable {
    @Serial
    private static final long serialVersionUID = -6495819087266690489L;

    private List<EmailRequestDto> toList;
    private String emailSubject;
    private String emailContentType;
    private int statusCode;
}