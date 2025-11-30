package edu.hcmute.controller;

import edu.hcmute.dto.UserDto;
import edu.hcmute.exception.UserException;
import edu.hcmute.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping({"/users", "/users/"})
    @Operation(description = "getAllUsers", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllUsers(@RequestHeader(required = false) String userType) throws UserException {
        log.info("UserController :: getAllUsers :: userType : {}", userType);
        List<UserDto> userList = userService.getAllUsers();
        return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    @GetMapping("/users/owners")
    @Operation(description = "getAllPropertyOwners", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllPropertyOwners() {
        log.info("UserController :: getAllPropertyOwners");
        List<UserDto> ownersList = userService.getAllPropertyOwners();
        return ResponseEntity.ok(ownersList);
    }

    @GetMapping("/users/agents")
    @Operation(description = "getAllAgents", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllAgents() {
        log.info("UserController :: getAllAgents");
        List<UserDto> agentsList = userService.getAllAgents();
        return ResponseEntity.ok(agentsList);
    }

    @PostMapping({"/users", "/users/"})
    @Operation(description = "createUser", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        userDto = userService.createUser(userDto);
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
        UserDto userDto = userService.getUserById(userId);
        return ResponseEntity.ok(userDto);
    }

    @DeleteMapping("/users/{userId}")
    @Operation(description = "deleteUserById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> deleteUserById(@PathVariable String userId) {
        log.info("UserController :: deleteUserById :: Id = {}", userId);
        boolean isDeleted = userService.deleteUserById(userId);
        Map<String, String> message = new HashMap<>();
        message.put("Message", "User with Id = " + userId + " deleted " + isDeleted);
        return ResponseEntity.ok(message);
    }

    @PutMapping("/users/profile")
    @Operation(description = "updateProfile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserDto userDto) {
        userDto = userService.updateUser(userDto);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/users/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        userService.forgotPassword(email);
        return ResponseEntity.ok().build();
    }
}