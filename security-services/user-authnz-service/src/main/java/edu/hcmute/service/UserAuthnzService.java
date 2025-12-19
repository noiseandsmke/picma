package edu.hcmute.service;

import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.RegisterRequest;
import edu.hcmute.dto.TokenResponse;

public interface UserAuthnzService {
    TokenResponse login(LoginRequest request);

    TokenResponse refresh(String refreshToken, String oldAccessToken);

    void logout(String refreshToken);

    void register(RegisterRequest request);
}