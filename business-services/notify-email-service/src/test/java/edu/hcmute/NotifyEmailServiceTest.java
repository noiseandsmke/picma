package edu.hcmute;

import edu.hcmute.dto.EmailRequestDto;
import edu.hcmute.dto.NotificationDto;
import edu.hcmute.outbound.EmailSender;
import edu.hcmute.outbound.MailTrapSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

public class NotifyEmailServiceTest extends NotifyEmailServiceApplicationTests {
    @Autowired
    private EmailSender emailSender;

    @Autowired
    private MailTrapSender mailTrapSender;

    @Test
    public void testSendEmail() {
        EmailRequestDto emailRequestDto01 = new EmailRequestDto("lodeh58941@fermiro.com", null, 0);
        EmailRequestDto emailRequestDto02 = new EmailRequestDto("qlgq1415@fermiro.com", null, 0);

        List<EmailRequestDto> emailRequestDtoList = new ArrayList<>();
        emailRequestDtoList.add(emailRequestDto01);
        emailRequestDtoList.add(emailRequestDto02);

        NotificationDto notificationDto = new NotificationDto(
                emailRequestDtoList,
                "Test PICMA email",
                "text/plain",
                0
        );

        mailTrapSender.sendNotification(notificationDto);
    }
}