package edu.hcmute.outbound;

import edu.hcmute.models.User;
import edu.hcmute.utils.OutboundUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

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

    public User createUser(User user, String accessToken) {
        HttpEntity<?> reqEntity = OutboundUtils.getHttpEntity(user, accessToken);
        try {
            ResponseEntity<?> resEntity = restTemplate.postForEntity(picma_users_api, reqEntity, Object.class);
            log.info("API response code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                HttpHeaders resHeaders = resEntity.getHeaders();
                if (resHeaders.containsKey("Location")) {
                    String headersValue = resHeaders.getFirst("Location");
                    log.info("Location = {}", headersValue);
                    String userId = headersValue.replace(picma_users_api + "/", "");
                    log.info("User ID = {}", userId);
                    String groupId;
                    if (!StringUtils.hasLength(user.getGroupId())) {
                        groupId = picma_group_prop_owners;
                        log.info("Property Owners group ID = {}", groupId);
                    } else {
                        groupId = user.getGroupId();
                        log.info("Other group ID = {}", groupId);
                    }
                    boolean isProvisioned = provisioningUser(userId, groupId, accessToken);
                    if (isProvisioned) {
                        user.setUserId(userId);
                        user.setGroupId(groupId);
                    } else {
                        // delete user
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
        HttpEntity<?> reqEntity = OutboundUtils.getHttpEntity(null, accessToken);
        try {
            ResponseEntity<?> resEntity = restTemplate.exchange(provisioningApi, HttpMethod.PUT, reqEntity, Object.class);
            log.info("User provisioning :: Status code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                provisioned = true;
            } else {
                throw new RuntimeException("Something went wrong while provisioning user");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return provisioned;
    }

    public boolean deprovisioningUser(String userId, String groupId, String accessToken) {
        boolean deprovisioned = false;
        log.info("User deprovisioning :: User ID = {}", userId);
        log.info("User deprovisioning :: Group ID = {}", groupId);
        String deprovisioningApi = picma_users_api + "/" + userId + "/groups/" + groupId;
        log.info("User deprovisioning :: API = {}", deprovisioningApi);
        HttpEntity<?> reqEntity = OutboundUtils.getHttpEntity(null, accessToken);
        try {
            ResponseEntity<?> resEntity = restTemplate.exchange(deprovisioningApi, HttpMethod.DELETE, reqEntity, Object.class);
            log.info("User deprovisioning :: Status code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                deprovisioned = true;
            } else {
                throw new RuntimeException("Something went wrong while deprovisioning user");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return deprovisioned;
    }

    public User getUserById(String userId, String accessToken) {
        log.info("Get User by ID :: User ID = {}", userId);
        String userApi = picma_users_api + "/" + userId;
        log.info("Get User by ID :: API = {}", userApi);
        HttpEntity<?> reqEntity = OutboundUtils.getHttpEntity(null, accessToken);
        try {
            ResponseEntity<User> resEntity = restTemplate.exchange(userApi, HttpMethod.GET, reqEntity, User.class);
            log.info("Get User by ID :: Status code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                return resEntity.getBody();
            } else {
                throw new RuntimeException("Something went wrong while getting user by ID");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public boolean deleteUserById(String userId, String accessToken) {
        boolean isDeleted = false;
        log.info("Delete User by ID :: User ID = {}", userId);
        String userApi = picma_users_api + "/" + userId;
        log.info("Delete User by ID :: API = {}", userApi);
        HttpEntity<?> reqEntity = OutboundUtils.getHttpEntity(null, accessToken);
        try {
            ResponseEntity<?> resEntity = restTemplate.exchange(userApi, HttpMethod.DELETE, reqEntity, ResponseEntity.class);
            log.info("Delete User by ID :: Status code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                isDeleted = true;
            } else {
                throw new RuntimeException("Something went wrong while getting user by ID");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return isDeleted;
    }

    public List<User> getAllUsers(String accessToken) {
        log.info("Get Users :: API = {}", picma_users_api);
        HttpEntity<?> reqEntity = OutboundUtils.getHttpEntity(null, accessToken);
        try {
            ResponseEntity<List<User>> resEntity = restTemplate.exchange(picma_users_api, HttpMethod.GET, reqEntity, new ParameterizedTypeReference<>() {
            });
            log.info("Get Users :: Status code = {}", resEntity.getStatusCode().value());
            if (resEntity.getStatusCode().is2xxSuccessful()) {
                List<User> userList = resEntity.getBody();
                log.info("Get Users :: NO. users = {}", userList != null ? userList.size() : 0);
                return Optional.ofNullable(userList).get();
            } else {
                throw new RuntimeException("HttpStatus code: " + resEntity.getStatusCode().value());
            }
//            ResponseEntity<?> resEntity = restTemplate.exchange(picma_users_api, HttpMethod.GET, reqEntity, Object.class);
//            log.info("Get Users :: Status code = {}", resEntity.getStatusCode().value());
//            if (resEntity.getStatusCode().is2xxSuccessful()) {
//                List<User> userListRes = (List<User>) resEntity.getBody();
//                log.info("Get Users :: NO. users = {}", userListRes != null ? userListRes.size() : 0);
//                return userListRes;
//            } else {
//                throw new RuntimeException("HttpStatus code: " + resEntity.getStatusCode().value());
//            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<User> getAllMembersOfGroup(String groupId, String accessToken) {
        log.info("Get POs :: API = {}", picma_groups_api);
        String picmaGroupsApi = picma_groups_api + "/" + groupId + "/members";
        log.info("Get POs :: API = {}", picmaGroupsApi);
        HttpEntity<?> reqEntity = OutboundUtils.getHttpEntity(null, accessToken);
        try {
            ResponseEntity<?> resEntity = restTemplate.exchange(picmaGroupsApi, HttpMethod.GET, reqEntity, Object.class);
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
}