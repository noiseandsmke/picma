package edu.hcmute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationRequestDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 2148681602351642249L;
    private Integer recipientId;
    private String title;
    private String message;
}