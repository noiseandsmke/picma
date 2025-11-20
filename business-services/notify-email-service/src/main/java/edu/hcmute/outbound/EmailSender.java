package edu.hcmute.outbound;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import edu.hcmute.dto.EmailRequestDto;
import edu.hcmute.dto.NotificationDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
public class EmailSender {
    @Value("${picma.properties.notification.api-key}")
    String sendgridApiKey;
    @Value("${picma.properties.lead.base-uri}")
    String leadBaseUri;
    @Value("${picma.properties.notification.marketingEmail}")
    String marketingEmail;

    public List<EmailRequestDto> sendNotification(NotificationDto notificationDto) {
        try {
            Email from = new Email(marketingEmail);
            notificationDto.getToList().forEach(emailRequestDto -> {
                Email to = new Email(emailRequestDto.getEmail());
                Content content = new Content(notificationDto.getEmailContentType(), "Welcome to PICMA");
                Mail mail = new Mail(from, notificationDto.getEmailSubject(), to, content);

//                SendGrid sendGrid = new SendGrid(System.getenv("SENDGRID_API_KEY"));
                SendGrid sendGrid = new SendGrid(System.getenv("SENDGRID_API_KEY"));
                Request request = new Request();
                try {
                    request.setMethod(Method.POST);
                    request.setEndpoint("mail/send");
                    request.setBody(mail.build());
                    Response response = sendGrid.api(request);
                    log.info("### sendNotification ###");
                    log.info("~~> status code = {}", response.getStatusCode());
                    log.info("~~> body = {}", response.getBody());
                    log.info("~~> headers = {}", response.getHeaders());
                } catch (IOException e) {
                    log.error(e.getMessage());
                }
            });
        } catch (Exception e) {
            log.error(e.getMessage());
        }
        return null;
    }
}