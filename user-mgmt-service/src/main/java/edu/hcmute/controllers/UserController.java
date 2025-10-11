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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
public class UserController {
    private String bearerPrefix = "Bearer ";
    private UserService userService;
    private HttpServletRequest request;

    public UserController(UserService userService, HttpServletRequest request) {
        this.userService = userService;
        this.request = request;
    }

    @GetMapping("/users")
    @Operation(description = "getAllUsers", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserBean>> getAllUsers() {
        log.info("UserController :: getAllUsers");
        String accessToken = request.getHeader("Authorization");
        if (StringUtils.hasText(accessToken) && StringUtils.hasText(bearerPrefix)) {
            accessToken = StringUtils.replace(accessToken, bearerPrefix, "");
        }
        List<UserBean> userList = userService.getAllUsers(accessToken);
        return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    @GetMapping("/users/owners")
    @Operation(description = "getAllPropertyOwners", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserBean>> getAllPropertyOwners(String groupId) {
        log.info("UserController :: getAllPropertyOwners :: groupId = {}", groupId);
        String accessToken = request.getHeader("Authorization");
        if (StringUtils.hasText(accessToken) && StringUtils.hasText(bearerPrefix)) {
            accessToken = StringUtils.replace(accessToken, bearerPrefix, "");
        }
        List<UserBean> ownersList = userService.getAllMembersOfGroup(groupId, accessToken);
        return ResponseEntity.ok(ownersList);
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
    @Operation(description = "createUser", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserBean> createUser(@RequestBody UserBean userBean) {
        String accessToken = request.getHeader("Authorization");
        if (StringUtils.hasText(accessToken) && StringUtils.hasText(bearerPrefix)) {
            accessToken = StringUtils.replace(accessToken, bearerPrefix, "");
        }
        userBean = userService.createUser(userBean, accessToken);
        return new ResponseEntity<>(userBean, HttpStatus.CREATED);
    }

    @GetMapping("/users/{userId}")
    @Operation(description = "getUserById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserBean> getUserById(@PathVariable String userId) {
        log.info("getUserById :: Id = {}", userId);
        String accessToken = request.getHeader("Authorization");
        if (StringUtils.hasText(accessToken) && StringUtils.hasText(bearerPrefix)) {
            accessToken = StringUtils.replace(accessToken, bearerPrefix, "");
        }
        UserBean userBean = userService.getUserById(userId, accessToken);
        return ResponseEntity.ok(userBean);
    }

    @DeleteMapping("/users/{userId}")
    @Operation(description = "deleteUserById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> deleteUserById(@PathVariable String userId) {
        log.info("deleteUserById :: Id = {}", userId);
        String accessToken = request.getHeader("Authorization");
        if (StringUtils.hasText(accessToken) && StringUtils.hasText(bearerPrefix)) {
            accessToken = StringUtils.replace(accessToken, bearerPrefix, "");
        }
        boolean isDeleted = userService.deleteUserById(userId, accessToken);
        Map<String, String> message = new HashMap<>();
        message.put("Message", "User with Id = " + userId + " deleted " + isDeleted);
        return ResponseEntity.ok(message);
    }
}