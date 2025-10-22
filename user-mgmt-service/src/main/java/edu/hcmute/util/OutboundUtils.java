package edu.hcmute.util;

import edu.hcmute.model.User;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

public class OutboundUtils {
    public static HttpEntity<?> getHttpEntity(User user, String accessToken) {
        MultiValueMap<String, String> headersMap = new LinkedMultiValueMap<>();
        headersMap.add("Authorization", "Bearer " + accessToken);
        headersMap.add("Content-Type", MediaType.APPLICATION_JSON_VALUE);
        return new HttpEntity<>(user, headersMap);
    }
}