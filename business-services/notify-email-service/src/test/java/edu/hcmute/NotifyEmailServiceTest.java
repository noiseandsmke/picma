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
        EmailRequestDto emailRequestDto01 = new EmailRequestDto();
        emailRequestDto01.setEmail("lodeh58941@fermiro.com");

        EmailRequestDto emailRequestDto02 = new EmailRequestDto();
        emailRequestDto02.setEmail("qlgq1415@fermiro.com");

        List<EmailRequestDto> emailRequestDtoList = new ArrayList<>();
        emailRequestDtoList.add(emailRequestDto01);
        emailRequestDtoList.add(emailRequestDto02);

        NotificationDto notificationDto = new NotificationDto();
        notificationDto.setEmailContentType("text/plain");
        notificationDto.setEmailSubject("Test PICMA email");
        notificationDto.setToList(emailRequestDtoList);

        mailTrapSender.sendNotification(notificationDto);
    }
}