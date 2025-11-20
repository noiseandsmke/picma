package edu.hcmute.outbound;

import edu.hcmute.dto.EmailRequestDto;
import edu.hcmute.dto.NotificationDto;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class MailTrapSender {
    private static final String EMAIL_TEMPLATE_NAME = "email-template.ftl";
    private static final String CHARSET_UTF8 = "UTF-8";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    private final JavaMailSender mailSender;
    private final Configuration configurationTemplate;

    @Value("${picma.properties.notification.api-key}")
    private String sendgridApiKey;

    @Value("${picma.properties.lead.base-uri}")
    private String leadBaseUri;

    @Value("${picma.properties.notification.marketingEmail}")
    private String marketingEmail;

    @Value("${picma.properties.notification.fromName:Marketing Admin}")
    private String fromName;

    public List<EmailRequestDto> sendNotification(NotificationDto notificationDto) {
        if (notificationDto == null || notificationDto.getToList() == null || notificationDto.getToList().isEmpty()) {
            log.warn("Notification request is null or has no recipients");
            return Collections.emptyList();
        }

        List<EmailRequestDto> successfulSends = new ArrayList<>();
        Template emailTemplate = loadEmailTemplate();

        if (emailTemplate == null) {
            log.error("Failed to load email template");
            return Collections.emptyList();
        }

        for (EmailRequestDto emailRequest : notificationDto.getToList()) {
            try {
                sendSingleEmail(emailRequest, notificationDto.getEmailSubject(), emailTemplate);
                successfulSends.add(emailRequest);
                log.info("Email successfully sent to: {}", emailRequest.getEmail());
            } catch (Exception e) {
                log.error("Failed to send email to: {}. Error: {}", emailRequest.getEmail(), e.getMessage(), e);
            }
        }

        log.info("Email notification completed. Sent {}/{} emails successfully",
                successfulSends.size(), notificationDto.getToList().size());

        return successfulSends;
    }

    private Template loadEmailTemplate() {
        try {
            return configurationTemplate.getTemplate(EMAIL_TEMPLATE_NAME);
        } catch (IOException e) {
            log.error("Failed to load email template: {}", EMAIL_TEMPLATE_NAME, e);
            return null;
        }
    }

    private void sendSingleEmail(EmailRequestDto emailRequest, String subject, Template emailTemplate)
            throws MessagingException, IOException, TemplateException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, CHARSET_UTF8);

        helper.setFrom(new InternetAddress(marketingEmail, fromName));
        helper.setTo(emailRequest.getEmail());
        helper.setSubject(subject);

        Map<String, Object> templateData = prepareTemplateData(emailRequest);

        String emailContent = FreeMarkerTemplateUtils.processTemplateIntoString(emailTemplate, templateData);
        helper.setText(emailContent, true);

        mailSender.send(message);
        log.debug("Email queued for sending to: {}", emailRequest.getEmail());
    }

    private Map<String, Object> prepareTemplateData(EmailRequestDto emailRequest) {
        Map<String, Object> modelData = new HashMap<>();
        modelData.put("recipientEmail", emailRequest.getEmail());
        modelData.put("recipientUserId", emailRequest.getUserId());
        modelData.put("fromName", fromName);
        modelData.put("fromEmail", marketingEmail);
        modelData.put("viewLeadLink", leadBaseUri);
        modelData.put("currentTime", LocalDateTime.now().format(DATE_FORMATTER));
        modelData.put("currentYear", String.valueOf(LocalDateTime.now().getYear()));
        return modelData;
    }
}