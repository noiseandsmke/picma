package edu.hcmute.outbound;

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
    private String picma_users_api;
    @Value("${picma.iam.groupsApi}")
    private String picma_groups_api;
    @Value("${picma.iam.groups.property-owners}")
    private String picma_group_prop_owners;

    public UserOutboundApi(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<User> getAllUsers(String accessToken) {
        log.info("Get Users :: API = {}", picma_users_api);
        MultiValueMap<String, String> headersMap = new LinkedMultiValueMap<>();
        headersMap.add("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headersMap);
        try {
            ResponseEntity<?> resEntity = restTemplate.exchange(picma_users_api, HttpMethod.GET, entity, Object.class);
            log.info("Get Users :: Status code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                List<User> userListRes = (List<User>) resEntity.getBody();
                log.info("Get Users :: NO. users = {}", userListRes != null ? userListRes.size() : 0);
                return userListRes;
            } else {
                throw new RuntimeException("HttpStatus code: " + resEntity.getStatusCode().value());
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<User> getAllPropertyOwners(String accessToken) {
        log.info("Get POs :: API = {}", picma_groups_api);
        picma_groups_api = picma_groups_api + "/" + picma_group_prop_owners + "/members";
        log.info("Get POs :: API = {}", picma_groups_api);
        MultiValueMap<String, String> headersMap = new LinkedMultiValueMap<>();
        headersMap.add("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headersMap);
        try {
            ResponseEntity<?> resEntity = restTemplate.exchange(picma_groups_api, HttpMethod.GET, entity, Object.class);
            log.info("Get POs :: Status code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                List<User> userListRes = (List<User>) resEntity.getBody();
                log.info("Get POs :: NO. users = {}", userListRes != null ? userListRes.size() : 0);
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
        HttpEntity<User> reqBody = new HttpEntity<>(user, headersMap);
        try {
            ResponseEntity<?> resEntity = restTemplate.postForEntity(picma_users_api, reqBody, Object.class);
            log.info("API response code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                HttpHeaders resHeaders = resEntity.getHeaders();
                if (resHeaders.containsKey("Location")) {
                    String headersValue = resHeaders.getFirst("Location");
                    log.info("Location = {}", headersValue);
                    String userId = headersValue.replace(picma_users_api + "/", "");
                    log.info("User ID = {}", userId);
                    String groupId = null;
                    if (!StringUtils.hasLength(user.getGroupId())) {
                        log.info("Property Owners group ID = {}", groupId);
                        groupId = picma_group_prop_owners;
                    } else {
                        log.info("Other group ID = {}", groupId);
                        groupId = user.getGroupId();
                    }
                    boolean isProvisioned = provisioningUser(userId, groupId, accessToken);
                    if (isProvisioned) {
                        user.setUserId(userId);
                        user.setGroupId(groupId);
                    } else {
                    }
                }
            } else {
                throw new RuntimeException("Something went wrong while creating user");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return user;
    }

    public boolean provisioningUser(String userId, String groupId, String accessToken) {
        boolean provisioned = false;
        String provisioningApi = picma_users_api + "/" + userId + "/groups/" + groupId;
        log.info("User provisioning :: API = {}", provisioningApi);
        MultiValueMap<String, String> headersMap = new LinkedMultiValueMap<>();
        headersMap.add("Authorization", "Bearer " + accessToken);

        HttpEntity<?> req = new HttpEntity<>(headersMap);
        ResponseEntity<?> resEntity = restTemplate.exchange(provisioningApi, HttpMethod.PUT, req, Object.class);
        log.info("User provisioning :: Status code = {}", resEntity.getStatusCode().value());
        if (resEntity.getStatusCode().is2xxSuccessful()) {
            provisioned = true;
        }
        return provisioned;
    }

    public boolean deprovisioningUser(String userId, String groupId, String accessToken) {
        boolean deprovisioned = false;
        log.info("User deprovisioning :: User ID = {}", userId);
        log.info("User deprovisioning :: Group ID = {}", groupId);
        String deprovisioningApi = picma_users_api + "/" + userId + "/groups/" + groupId;
        log.info("User deprovisioning :: API = {}", deprovisioningApi);
        MultiValueMap<String, String> headersMap = new LinkedMultiValueMap<>();
        headersMap.add("Authorization", "Bearer " + accessToken);

        HttpEntity<?> req = new HttpEntity<>(headersMap);
        ResponseEntity<?> resEntity = restTemplate.exchange(deprovisioningApi, HttpMethod.DELETE, req, Object.class);
        log.info("User deprovisioning :: Status code = {}", resEntity.getStatusCode().value());
        if (resEntity.getStatusCode().is2xxSuccessful()) {
            deprovisioned = true;
        }
        return deprovisioned;
    }
}