package edu.hcmute.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.UserInfo;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Slf4j
public class JwtUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static UserInfo parseJwt(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            log.debug("JWT Payload: {}", payload);
            JsonNode node = objectMapper.readTree(payload);
            String sub = node.has("sub") ? node.get("sub").asText() : null;
            String username = node.has("preferred_username") ? node.get("preferred_username").asText() : null;
            Boolean emailVerified = node.has("email_verified") && node.get("email_verified").asBoolean();
            String name = node.has("name") ? node.get("name").asText() : null;
            String givenName = node.has("given_name") ? node.get("given_name").asText() : null;
            String familyName = node.has("family_name") ? node.get("family_name").asText() : null;
            String email = node.has("email") ? node.get("email").asText() : null;
            String zipcode = node.has("zipcode") ? node.get("zipcode").asText() : null;
            List<String> roles = new ArrayList<>();
            if (node.has("realm_access") && node.get("realm_access").has("roles")) {
                JsonNode rolesNode = node.get("realm_access").get("roles");
                rolesNode.forEach(roleNode -> roles.add(roleNode.asText()));
            }
            UserInfo.RealmAccess realmAccess = new UserInfo.RealmAccess(roles);
            return new UserInfo(sub, username, emailVerified, name, givenName, familyName, email, zipcode, realmAccess);
        } catch (Exception e) {
            log.error("Failed to parse JWT token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to parse JWT token: " + e.getMessage(), e);
        }
    }

    public static String getJtiFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            JsonNode node = objectMapper.readTree(payload);
            return node.has("jti") ? node.get("jti").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract JTI from token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract JTI from token: " + e.getMessage(), e);
        }
    }
}