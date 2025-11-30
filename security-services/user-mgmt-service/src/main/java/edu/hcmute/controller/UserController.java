package edu.hcmute.controller;

import edu.hcmute.dto.UserDto;
import edu.hcmute.exception.UserException;
import edu.hcmute.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/user")
    @Operation(description = "getAllUsers", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllUsers() throws UserException {
        log.info("UserController :: getAllUsers");
        List<UserDto> userList = userService.getAllUsers();
        return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    @GetMapping("/user/owners")
    @Operation(description = "getAllPropertyOwners", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllPropertyOwners() {
        log.info("UserController :: getAllPropertyOwners");
        List<UserDto> ownersList = userService.getAllPropertyOwners();
        return ResponseEntity.ok(ownersList);
    }

    @GetMapping("/user/agents")
    @Operation(description = "getAllAgents", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllAgents() {
        log.info("UserController :: getAllAgents");
        List<UserDto> agentsList = userService.getAllAgents();
        return ResponseEntity.ok(agentsList);
    }

    @PostMapping("/user")
    @Operation(description = "createUser", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        userDto = userService.createUser(userDto);
        return new ResponseEntity<>(userDto, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    @Operation(description = "getUserById", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> getUserById(@PathVariable String userId) {
        log.info("UserController :: getUserById :: Id = {}", userId);
        UserDto userDto = userService.getUserById(userId);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/user/{userId}/status")
    @Operation(description = "updateUserStatus", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable String userId, @RequestParam boolean enabled) {
        log.info("UserController :: updateUserStatus :: Id = {}, enabled = {}", userId, enabled);
        userService.updateUserStatus(userId, enabled);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User status updated to " + enabled);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/{userId}/switch-group")
    @Operation(description = "switchGroup", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> switchGroup(@PathVariable String userId, @RequestParam String targetGroup) {
        log.info("UserController :: switchGroup :: Id = {}, targetGroup = {}", userId, targetGroup);
        userService.switchGroup(userId, targetGroup);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User switched to group " + targetGroup);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/profile")
    @Operation(description = "updateProfile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserDto userDto) {
        userDto = userService.updateUser(userDto);
        return ResponseEntity.ok(userDto);
    }
}