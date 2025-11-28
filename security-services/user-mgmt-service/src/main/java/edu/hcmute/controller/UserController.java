package edu.hcmute.controller;

import edu.hcmute.dto.UserDto;
import edu.hcmute.exception.UserException;
import edu.hcmute.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    private final String bearerPrefix = "Bearer ";
    private final UserService userService;
    private final HttpServletRequest request;

    public UserController(UserService userService, HttpServletRequest request) {
        this.userService = userService;
        this.request = request;
    }

    @GetMapping({"/users", "/users/"})
    @Operation(description = "getAllUsers", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllUsers(@RequestHeader(required = false) String userType) throws UserException {
        log.info("UserController :: getAllUsers :: userType : {}", userType);
        String accessToken = getAccessToken();
        List<UserDto> userList = userService.getAllUsers(accessToken);
        return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    @GetMapping("/users/owners")
    @Operation(description = "getAllPropertyOwners", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllPropertyOwners() {
        log.info("UserController :: getAllPropertyOwners");
        String accessToken = getAccessToken();
        List<UserDto> ownersList = userService.getAllPropertyOwners(accessToken);
        return ResponseEntity.ok(ownersList);
    }

    @GetMapping("/users/agents")
    @Operation(description = "getAllAgents", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllAgents() {
        log.info("UserController :: getAllAgents");
        String accessToken = getAccessToken();
        List<UserDto> agentsList = userService.getAllAgents(accessToken);
        return ResponseEntity.ok(agentsList);
    }

    @GetMapping("/users/brokers")
    @Operation(description = "getAllBrokers", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllBrokers() {
        log.info("UserController :: getAllBrokers");
        String accessToken = getAccessToken();
        List<UserDto> brokersList = userService.getAllBrokers(accessToken);
        return ResponseEntity.ok(brokersList);
    }

    @GetMapping("/users/staff")
    @Operation(description = "getAllStaff", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllStaff() {
        log.info("UserController :: getAllStaff");
        String accessToken = getAccessToken();
        List<UserDto> staffList = userService.getAllStaff(accessToken);
        return ResponseEntity.ok(staffList);
    }

    @PostMapping({"/users", "/users/"})
    @Operation(description = "createUser", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        String accessToken = getAccessToken();
        userDto = userService.createUser(userDto, accessToken);
        return new ResponseEntity<>(userDto, HttpStatus.CREATED);
    }

    @PostMapping("/users/register")
    @Operation(description = "registerUser")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody UserDto userDto) {
        // Public endpoint for self-registration
        userDto = userService.registerUser(userDto);
        return new ResponseEntity<>(userDto, HttpStatus.CREATED);
    }

    @GetMapping("/users/{userId}")
    @Operation(description = "getUserById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> getUserById(@PathVariable String userId) {
        log.info("UserController :: getUserById :: Id = {}", userId);
        String accessToken = getAccessToken();
        UserDto userDto = userService.getUserById(userId, accessToken);
        return ResponseEntity.ok(userDto);
    }

    @DeleteMapping("/users/{userId}")
    @Operation(description = "deleteUserById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> deleteUserById(@PathVariable String userId) {
        log.info("UserController :: deleteUserById :: Id = {}", userId);
        String accessToken = getAccessToken();
        boolean isDeleted = userService.deleteUserById(userId, accessToken);
        Map<String, String> message = new HashMap<>();
        message.put("Message", "User with Id = " + userId + " deleted " + isDeleted);
        return ResponseEntity.ok(message);
    }

    @PutMapping("/users/profile")
    @Operation(description = "updateProfile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserDto userDto) {
        String accessToken = getAccessToken();
        userDto = userService.updateUser(userDto, accessToken);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/users/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        userService.forgotPassword(email);
        return ResponseEntity.ok().build();
    }

    private String getAccessToken() {
        String accessToken = request.getHeader("Authorization");
        if (StringUtils.hasText(accessToken) && StringUtils.hasText(bearerPrefix)) {
            return StringUtils.replace(accessToken, bearerPrefix, "");
        }
        return null;
    }
}