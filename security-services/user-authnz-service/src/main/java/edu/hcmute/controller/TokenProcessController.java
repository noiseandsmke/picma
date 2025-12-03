package edu.hcmute.controller;

import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.RefreshTokenRequest;
import edu.hcmute.dto.RegisterRequest;
import edu.hcmute.dto.TokenResponse;
import edu.hcmute.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
@Slf4j
public class TokenProcessController {
    private final AuthService authService;

    @Operation(summary = "Login with username and password", description = "Authenticates user and returns JWT tokens.")
    @ApiResponse(responseCode = "200", description = "Successful operation", content = @Content(schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest loginRequest) {
        log.info("Controller received login request for user: {}", loginRequest.username());
        TokenResponse response = authService.login(loginRequest);
        log.info("Controller returning token response: accessToken exists={}, refreshToken exists={}",
                response.accessToken() != null, response.refreshToken() != null);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Register new user", description = "Registers a new user in Keycloak.")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @Operation(summary = "Refresh access token", description = "Obtains a new access token using a refresh token.")
    @ApiResponse(responseCode = "200", description = "Successful operation", content = @Content(schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @RequestBody RefreshTokenRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String oldAccessToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            oldAccessToken = authHeader.substring(7);
        }
        TokenResponse response = authService.refresh(request.refreshToken(), oldAccessToken);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Logout", description = "Logs out the user by invalidating the refresh token.")
    @ApiResponse(responseCode = "200", description = "Logged out successfully")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestParam("refresh_token") String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}