package edu.hcmute.controller;

import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.RegisterRequest;
import edu.hcmute.dto.TokenResponse;
import edu.hcmute.service.UserAuthnzService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor

public class UserAuthnzController {
    private final UserAuthnzService userAuthnzService;

    @Operation(summary = "Login with username and password", description = "Authenticates user and returns JWT tokens.")
    @ApiResponse(responseCode = "200", description = "Successful operation", content = @Content(schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest loginRequest) {
        TokenResponse response = userAuthnzService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Register new user", description = "Registers a new user in Keycloak.")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody @Valid RegisterRequest registerRequest) {
        userAuthnzService.register(registerRequest);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }


    @Operation(summary = "Logout", description = "Logs out the user.")
    @ApiResponse(responseCode = "200", description = "Logged out successfully")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        userAuthnzService.logout();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}