package edu.hcmute.config;

import edu.hcmute.entity.User;
import edu.hcmute.outbound.KeycloakAdminClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminRunner implements CommandLineRunner {

    private final KeycloakAdminClient keycloakAdminClient;

    @Value("${picma.admin.username}")
    private String username;

    @Value("${picma.admin.password}")
    private String password;

    @Value("${picma.admin.email}")
    private String email;

    @Override
    public void run(String... args) {
        log.info("Checking Admin account...");
        try {
            List<User> users = keycloakAdminClient.getUsers(username);
            if (users != null && !users.isEmpty()) {
                log.info("Admin account '{}' already exists.", username);
                return;
            }
            User admin = new User();
            admin.setUsername(username);
            admin.setEmail(email);
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setEnabled(true);
            admin.setEmailVerified(true);
            if (StringUtils.hasText(password)) {
                User.CredentialRepresentation credential = new User.CredentialRepresentation();
                credential.setType("password");
                credential.setValue(password);
                credential.setTemporary(false);
                admin.setCredentials(Collections.singletonList(credential));
            }
            keycloakAdminClient.createUser(admin);
            log.info("Admin account '{}' created successfully.", username);
        } catch (Exception e) {
            log.warn("Failed to process Admin account: {}", e.getMessage());
        }
    }
}