package edu.hcmute.service;

import edu.hcmute.dto.LoginRequest;
import edu.hcmute.dto.LoginResponse;
import edu.hcmute.dto.RegisterRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);

    LoginResponse refresh(String refreshToken, String oldAccessToken);

    void logout(String refreshToken);

    void register(RegisterRequest request);
}