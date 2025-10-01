package edu.hcmute.outbound;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.models.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@Slf4j
public class UserOutboundApi {
    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;
    @Value("${picma.iam.usersApi}")
    private String picma_user_api;

    public UserOutboundApi(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public List<User> getAllPropertyOwners(String accessToken) {
        log.info("PICMA users API = {}", picma_user_api);
        MultiValueMap<String, String> headerMap = new LinkedMultiValueMap<>();
        headerMap.add("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headerMap);
        try {
            long start = System.currentTimeMillis();
            ResponseEntity<?> responseEntity = restTemplate.exchange(picma_user_api, HttpMethod.GET, entity, Object.class);
            log.info("API response code = {}", responseEntity.getStatusCode().value());
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                List<User> userListRes = (List<User>) responseEntity.getBody();
                log.info("Count of users = {}", userListRes != null ? userListRes.size() : 0);
                long end = System.currentTimeMillis();
                log.info("Time taken = {}", (end - start));
                return userListRes;
            } else {
                throw new RuntimeException("HttpStatus code: " + responseEntity.getStatusCode().value());
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

    public User createUser(User user) {
        return null;
    }
}