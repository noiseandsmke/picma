package edu.hcmute.controllers;

import edu.hcmute.beans.UserBean;
import edu.hcmute.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
public class UserController {
    private String bearerPrefix = "Bearer ";
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    @Operation(description = "getAllUsers", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserBean>> getAllUsers(HttpServletRequest request) {
        log.info("UserController :: getAllUsers");
        String accessToken = request.getHeader("Authorization");
        log.info("bearer token = {}", accessToken);
        if (StringUtils.hasText(accessToken) && StringUtils.hasText(bearerPrefix)) {
            accessToken = StringUtils.replace(accessToken, bearerPrefix, "");
        }
        log.info("token = {}", accessToken);
        List<UserBean> userList = userService.getAllUsers(accessToken);
        return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    @GetMapping("/users/owners")
    public ResponseEntity<List<UserBean>> getAllPropertyOwners() {
        return null;
    }

    @GetMapping("/users/agents")
    public ResponseEntity<List<UserBean>> getAllAgents() {
        return null;
    }

    @GetMapping("/users/brokers")
    public ResponseEntity<List<UserBean>> getAllBrokers() {
        return null;
    }

    @PostMapping("/users")
    public ResponseEntity<UserBean> createUser() {
        return null;
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserBean> getUserById(@PathVariable String userId) {
        return null;
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<UserBean> deleteUserById(@PathVariable String userId) {
        return null;
    }
}