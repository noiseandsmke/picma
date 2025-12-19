package edu.hcmute.controller;

import edu.hcmute.dto.UserDto;
import edu.hcmute.service.UserMgmtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserMgmtController {
    private final UserMgmtService userMgmtService;

    @GetMapping("/user")
    @Operation(description = "getAllUsers", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllUsers(@RequestParam(required = false) String search) {
        List<UserDto> userList = userMgmtService.getAllUsers(search);
        return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    @GetMapping("/user/owners")
    @Operation(description = "getAllPropertyOwners", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllPropertyOwners() {
        List<UserDto> ownersList = userMgmtService.getAllPropertyOwners();
        return ResponseEntity.ok(ownersList);
    }

    @GetMapping("/user/agents")
    @Operation(description = "getAllAgents", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAllAgents() {
        List<UserDto> agentsList = userMgmtService.getAllAgents();
        return ResponseEntity.ok(agentsList);
    }

    @GetMapping("/user/agents/zipcode/{zipcode}")
    @Operation(description = "Get agents by zip code", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserDto>> getAgentsByZipCode(@PathVariable String zipcode) {
        List<UserDto> agentsList = userMgmtService.getAgentsByZipCode(zipcode);
        return ResponseEntity.ok(agentsList);
    }

    @GetMapping("/user/{userId}")
    @Operation(description = "Get user by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> getUserById(@PathVariable String userId) {
        UserDto userDto = userMgmtService.getUserById(userId);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/user/profile")
    @Operation(description = "updateProfile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserDto userDto) {
        userDto = userMgmtService.updateUser(userDto);
        return ResponseEntity.ok(userDto);
    }
}