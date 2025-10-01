package edu.hcmute.outbound;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.models.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@Slf4j
public class UserOutboundApi {
    private RestTemplate restTemplate;
    @Value("${picma.iam.usersApi}")
    private String picma_user_api;
    @Value("${picma.iam.groups.property-owners}")
    private String propertyOwnersGroupsId;

    public UserOutboundApi(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
    }

    public List<User> getAllPropertyOwners(String accessToken) {
        log.info("PICMA users API = {}", picma_user_api);
        MultiValueMap<String, String> headersMap = new LinkedMultiValueMap<>();
        headersMap.add("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headersMap);
        try {
            long start = System.currentTimeMillis();
            ResponseEntity<?> resEntity = restTemplate.exchange(picma_user_api, HttpMethod.GET, entity, Object.class);
            log.info("API response code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                List<User> userListRes = (List<User>) resEntity.getBody();
                log.info("Count of users = {}", userListRes != null ? userListRes.size() : 0);
                long end = System.currentTimeMillis();
                log.info("Time taken = {}", (end - start));
                return userListRes;
            } else {
                throw new RuntimeException("HttpStatus code: " + resEntity.getStatusCode().value());
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<User> getAllAgents() {
        return null;
    }

    public List<User> getAllBrokers() {
        return null;
    }

    public User createUser(User user, String accessToken) {
        MultiValueMap<String, String> headersMap = new LinkedMultiValueMap<>();
        headersMap.add("Authorization", "Bearer " + accessToken);
        headersMap.add("Content-Type", MediaType.APPLICATION_JSON_VALUE);
        HttpEntity reqBody = new HttpEntity<>(user, headersMap);

        ResponseEntity<?> resEntity = restTemplate.postForEntity(picma_user_api, reqBody, null);
        log.info("API response code = {}", resEntity.getStatusCode().value());
        if (resEntity.getStatusCode().is2xxSuccessful()) {
            HttpHeaders resHeaders = resEntity.getHeaders();
            if (resHeaders.containsKey("Location")) {
                String headersValue = resHeaders.getFirst("Location");
                log.info("Location = {}", headersValue);
                String userId = headersValue.replace(picma_user_api + "/", "");
                log.info("User ID = {}", userId);
                String groupId = null;
                if (!StringUtils.hasLength(user.getGroupId())) {
                    groupId = propertyOwnersGroupsId;
                } else {
                    groupId = user.getGroupId();
                }
            }
        }
        return null;
    }
}