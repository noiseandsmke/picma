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
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() throws UserException {
        log.info("UserController :: getAllUsers");
        List<UserDto> userList = userService.getAllUsers();
        return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    @GetMapping("/user/owners")
    @Operation(description = "getAllPropertyOwners", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACMAAGENT')")
    public ResponseEntity<List<UserDto>> getAllPropertyOwners() {
        log.info("UserController :: getAllPropertyOwners");
        List<UserDto> ownersList = userService.getAllPropertyOwners();
        return ResponseEntity.ok(ownersList);
    }

    @GetMapping("/user/agents")
    @Operation(description = "getAllAgents", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllAgents() {
        log.info("UserController :: getAllAgents");
        List<UserDto> agentsList = userService.getAllAgents();
        return ResponseEntity.ok(agentsList);
    }

    @PostMapping("/user")
    @Operation(description = "createUser", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        userDto = userService.createUser(userDto);
        return new ResponseEntity<>(userDto, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    @Operation(description = "getUserById", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable String userId) {
        log.info("UserController :: getUserById :: Id = {}", userId);
        UserDto userDto = userService.getUserById(userId);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/user/status")
    @Operation(description = "updateUserStatus", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateUserStatus(@RequestBody edu.hcmute.dto.UserActionDto userActionDto) {
        String userId = userActionDto.userId();
        log.info("UserController :: updateUserStatus :: Id = {}", userId);
        userService.updateUserStatus(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User status updated");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/switch-group")
    @Operation(description = "switchGroup", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> switchGroup(@RequestBody edu.hcmute.dto.UserActionDto userActionDto) {
        String userId = userActionDto.userId();
        log.info("UserController :: switchGroup :: Id = {}", userId);
        userService.switchGroup(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User group switched");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/profile")
    @Operation(description = "updateProfile", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("#userDto.id == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserDto userDto) {
        userDto = userService.updateUser(userDto);
        return ResponseEntity.ok(userDto);
    }
}