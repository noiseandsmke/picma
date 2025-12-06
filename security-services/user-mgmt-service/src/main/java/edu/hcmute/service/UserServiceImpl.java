package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.User;
import edu.hcmute.exception.UserException;
import edu.hcmute.mapper.UserMapper;
import edu.hcmute.outbound.KeycloakAdminClient;
import edu.hcmute.outbound.KeycloakGroupClient;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private static final String GROUP_AGENTS = "agents";
    private static final String GROUP_OWNERS = "owners";

    private final UserMapper userMapper;
    private final KeycloakAdminClient keycloakAdminClient;
    private final KeycloakGroupClient keycloakGroupClient;

    @Value("${picma.iam.groups.owners}")
    private String ownersGroupId;
    @Value("${picma.iam.groups.agents}")
    private String agentsGroupId;

    @Override
    public UserDto createUser(UserDto userDto) {
        log.info("Request data = {}", userDto.toString());
        User user = prepareUserEntity(userDto);
        log.info("Creating User :: {}", user);
        ResponseEntity<Void> response = keycloakAdminClient.createUser(user);
        if (response.getStatusCode().is2xxSuccessful()) {
            return processCreatedUser(response.getHeaders().getLocation(), user, userDto.group());
        } else {
            throw new IllegalArgumentException("Failed to create user: " + response.getStatusCode());
        }
    }

    private User prepareUserEntity(UserDto userDto) {
        User user = userMapper.toEntity(userDto);
        user.setEnabled(true);
        if (StringUtils.hasText(userDto.password())) {
            User.CredentialRepresentation credential = new User.CredentialRepresentation();
            credential.setType("password");
            credential.setValue(userDto.password());
            credential.setTemporary(false);
            user.setCredentials(Collections.singletonList(credential));
        }
        return user;
    }

    private UserDto processCreatedUser(URI location, User user, String requestedGroupId) {
        String userId = extractUserIdFromLocation(location);
        if (userId != null) {
            log.info("Created User ID = {}", userId);
            user.setId(userId);
            String groupId = resolveGroupId(requestedGroupId);
            assignUserToGroup(userId, groupId);
            return userMapper.toDtoWithGroup(user, groupId.equals(agentsGroupId) ? GROUP_AGENTS : GROUP_OWNERS);
        } else {
            throw new IllegalStateException("User created but Location header missing");
        }
    }

    private String resolveGroupId(String requestedGroupId) {
        if (!StringUtils.hasLength(requestedGroupId)) {
            log.info("Assigning default Property Owners group ID = {}", ownersGroupId);
            return ownersGroupId;
        } else if (GROUP_AGENTS.equalsIgnoreCase(requestedGroupId)) {
            return agentsGroupId;
        } else if (GROUP_OWNERS.equalsIgnoreCase(requestedGroupId)) {
            return ownersGroupId;
        }
        return requestedGroupId;
    }

    private void assignUserToGroup(String userId, String groupId) {
        try {
            keycloakAdminClient.joinGroup(userId, groupId);
        } catch (Exception e) {
            log.error("Failed to join group {} for user {}", groupId, userId, e);
            throw new IllegalStateException("User created but failed to join group", e);
        }
    }

    private String extractUserIdFromLocation(URI location) {
        if (location == null) return null;
        String path = location.getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }

    @Override
    public List<UserDto> getAgentsByZipCode(String zipcode) {
        if (!StringUtils.hasText(zipcode)) {
            return Collections.emptyList();
        }
        List<UserDto> allAgents = getAllAgents();
        return allAgents.stream()
                .filter(agent -> zipcode.equals(agent.zipcode()))
                .toList();
    }

    @Override
    public UserDto getUserById(String userId) {
        try {
            return userMapper.toDto(keycloakAdminClient.getUserById(userId));
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId);
        } catch (FeignException.Unauthorized e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized to access Keycloak Admin API. Check user permissions.");
        } catch (Exception e) {
            throw new UserException("Error fetching user by id " + userId, 500, e);
        }
    }

    @Override
    public void convertOwnerToAgent(String userId) {
        try {
            List<Map<String, Object>> currentGroups = keycloakAdminClient.getUserGroups(userId);
            boolean isOwner = false;
            for (Map<String, Object> group : currentGroups) {
                String id = (String) group.get("id");
                if (id.equals(ownersGroupId)) {
                    isOwner = true;
                    break;
                }
            }
            if (!isOwner) {
                log.warn("User {} is not in Owners group. Cannot convert to Agent.", userId);
                throw new IllegalStateException("User is not a Property Owner. Cannot convert to Agent.");
            }
            log.info("Removing user {} from Owners group", userId);
            keycloakAdminClient.leaveGroup(userId, ownersGroupId);
            log.info("Adding user {} to Agents group", userId);
            keycloakAdminClient.joinGroup(userId, agentsGroupId);
            log.info("Successfully converted user {} from Owner to Agent", userId);
        } catch (Exception e) {
            log.error("Failed to convert user {} from Owner to Agent", userId, e);
            throw new IllegalStateException("Failed to convert user from Owner to Agent: " + e.getMessage(), e);
        }
    }

    @Override
    public UserDto updateUser(UserDto userDto) {
        User user = userMapper.toEntity(userDto);
        if (user.getId() != null) {
            keycloakAdminClient.updateUser(user.getId(), user);
        }
        return userDto;
    }

    @Override
    public List<UserDto> getAllUsers(String search) {
        log.info("UserServiceImpl :: getAllUsers using Feign Client with search: {}", search);
        if (!StringUtils.hasText(search)) {
            search = "*";
        }
        try {
            List<User> userList = keycloakAdminClient.getUsers(search);
            if (CollectionUtils.isEmpty(userList)) {
                return new ArrayList<>();
            }
            List<UserDto> uiUserList = new ArrayList<>();
            for (User user : userList) {
                processUserForList(user, uiUserList);
            }
            log.info("UserServiceImpl :: uiUserList size = {}", uiUserList.size());
            return uiUserList;
        } catch (FeignException.Unauthorized e) {
            log.error("Unauthorized access to Keycloak Admin API", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access to Keycloak Admin API");
        } catch (Exception e) {
            log.error("Error fetching users", e);
            throw new UserException("Error fetching users", 500, e);
        }
    }

    private void processUserForList(User user, List<UserDto> uiUserList) {
        try {
            String priorityGroup = fetchUserPriorityGroup(user.getId());
            uiUserList.add(userMapper.toDtoWithGroup(user, priorityGroup));
        } catch (Exception e) {
            log.error("Error mapping user {}", user.getId(), e);
        }
    }

    private String fetchUserPriorityGroup(String userId) {
        try {
            List<Map<String, Object>> groups = keycloakAdminClient.getUserGroups(userId);
            return determinePriorityGroup(groups);
        } catch (Exception e) {
            log.warn("Could not fetch groups for user {}: {}", userId, e.getMessage());
            return null;
        }
    }

    private String determinePriorityGroup(List<Map<String, Object>> groups) {
        if (CollectionUtils.isEmpty(groups)) {
            return null;
        }
        boolean isAgent = false;
        boolean isOwner = false;
        for (Map<String, Object> group : groups) {
            String groupId = (String) group.get("id");
            String groupName = (String) group.get("name");
            if ("admin".equalsIgnoreCase(groupName) || "admins".equalsIgnoreCase(groupName)) {
                return "admin";
            }
            if (Objects.equals(groupId, agentsGroupId)) {
                isAgent = true;
            } else if (Objects.equals(groupId, ownersGroupId)) {
                isOwner = true;
            }
        }
        if (isAgent) return GROUP_AGENTS;
        if (isOwner) return GROUP_OWNERS;
        return (String) groups.get(0).get("name");
    }

    @Override
    public List<UserDto> getAllMembersOfGroup(String groupId) {
        try {
            List<User> userList = keycloakGroupClient.getGroupMembers(groupId);
            if (!CollectionUtils.isEmpty(userList)) {
                return userList.stream().map(userMapper::toDto).toList();
            } else {
                return new ArrayList<>();
            }
        } catch (FeignException.Unauthorized e) {
            log.error("Unauthorized access to Keycloak Group API", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access to Keycloak Group API");
        } catch (Exception e) {
            log.error("Error fetching group members", e);
            throw new UserException("Error fetching group members", 500, e);
        }
    }

    @Override
    public List<UserDto> getAllAgents() {
        return getAllMembersOfGroup(agentsGroupId);
    }

    @Override
    public List<UserDto> getAllPropertyOwners() {
        return getAllMembersOfGroup(ownersGroupId);
    }
}