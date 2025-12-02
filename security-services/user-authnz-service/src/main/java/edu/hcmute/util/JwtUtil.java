package edu.hcmute.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.UserInfo;

import java.util.Base64;

public class JwtUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static UserInfo parseJwt(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token");
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            return objectMapper.readValue(payload, UserInfo.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JWT token", e);
        }
    }

    public static String getJtiFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token");
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            var node = objectMapper.readTree(payload);
            return node.get("jti").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract JTI from token", e);
        }
    }
}