package edu.hcmute.outbound;

import edu.hcmute.models.User;
import edu.hcmute.models.UserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class UserOutboundApi {
    private RestTemplate restTemplate;
    @Value("${picma.iam.usersApi}")
    private String picma_user_api;

    public UserOutboundApi(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<User> getAllPropertyOwners(String accessToken) throws URISyntaxException {
        log.info("PICMA users API = {}", picma_user_api);

        List<User> userList = new ArrayList<>();

        MultiValueMap<String, String> headerMap = new LinkedMultiValueMap<>();
        headerMap.add("Authorization", "Bearer " + accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headerMap);
        ResponseEntity<UserResponse> responseEntity = restTemplate.exchange(picma_user_api, HttpMethod.GET, entity, UserResponse.class);

        log.info("API response code = {}", responseEntity.getStatusCode().value());
        if (responseEntity.getStatusCode().is2xxSuccessful()) {
            UserResponse userResBody = responseEntity.getBody();
            log.info("Count of users = {}", userResBody.getUserList().size());
        }
        return null;
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