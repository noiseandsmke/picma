package edu.hcmute.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.dto.UserInfo;
import edu.hcmute.exception.AuthException;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Slf4j
public class JwtUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String REALM_ACCESS = "realm_access";
    private static final String ROLES = "roles";
    private static final String CLAIM_SUB = "sub";
    private static final String CLAIM_PREFERRED_USERNAME = "preferred_username";
    private static final String CLAIM_EMAIL_VERIFIED = "email_verified";
    private static final String CLAIM_NAME = "name";
    private static final String CLAIM_GIVEN_NAME = "given_name";
    private static final String CLAIM_FAMILY_NAME = "family_name";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ZIPCODE = "zipcode";

    private JwtUtil() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    public static UserInfo parseJwt(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new AuthException("Invalid JWT token format", 400);
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            log.debug("JWT Payload: {}", payload);
            JsonNode node = objectMapper.readTree(payload);
            String sub = node.has(CLAIM_SUB) ? node.get(CLAIM_SUB).asText() : null;
            String username = node.has(CLAIM_PREFERRED_USERNAME) ? node.get(CLAIM_PREFERRED_USERNAME).asText() : null;
            Boolean emailVerified = node.has(CLAIM_EMAIL_VERIFIED) && node.get(CLAIM_EMAIL_VERIFIED).asBoolean();
            String name = node.has(CLAIM_NAME) ? node.get(CLAIM_NAME).asText() : null;
            String givenName = node.has(CLAIM_GIVEN_NAME) ? node.get(CLAIM_GIVEN_NAME).asText() : null;
            String familyName = node.has(CLAIM_FAMILY_NAME) ? node.get(CLAIM_FAMILY_NAME).asText() : null;
            String email = node.has(CLAIM_EMAIL) ? node.get(CLAIM_EMAIL).asText() : null;
            String zipcode = node.has(CLAIM_ZIPCODE) ? node.get(CLAIM_ZIPCODE).asText() : null;
            List<String> roles = new ArrayList<>();
            if (node.has(REALM_ACCESS) && node.get(REALM_ACCESS).has(ROLES)) {
                JsonNode rolesNode = node.get(REALM_ACCESS).get(ROLES);
                rolesNode.forEach(roleNode -> roles.add(roleNode.asText()));
            }
            UserInfo.RealmAccess realmAccess = new UserInfo.RealmAccess(roles);
            return new UserInfo(sub, username, emailVerified, name, givenName, familyName, email, zipcode, realmAccess);
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse JWT token: {}", e.getMessage(), e);
            throw new AuthException("Failed to parse JWT token: " + e.getMessage(), 400);
        }
    }
}