package edu.hcmute.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
public class TokenProcessController {
    @GetMapping("/token")
    public Map<String, String> generateToken() {
        log.info("TokenProcessController :: generateToken");
        OAuth2User oAuth2User = (OAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.info("Logged in user : {}", oAuth2User.getName());
        Map<String, String> usersMap = new HashMap<>();
        usersMap.put("Logged-in user", oAuth2User.getName());

        log.info("Printing ID token attributes");
        oAuth2User.getAttributes().keySet().forEach(key -> {
            System.out.println(key + " = " + oAuth2User.getAttributes().get(key));
        });
        return usersMap;
    }
}