package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.User;
import edu.hcmute.mapper.UserMapper;
import edu.hcmute.outbound.KeycloakAdminClient;
import edu.hcmute.outbound.KeycloakGroupClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
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
        User user = userMapper.toEntity(userDto);
        user.setEnabled(true);
        if (StringUtils.hasText(userDto.password())) {
            User.CredentialRepresentation credential = new User.CredentialRepresentation();
            credential.setType("password");
            credential.setValue(userDto.password());
            credential.setTemporary(false);
            user.setCredentials(Collections.singletonList(credential));
        }
        log.info("Creating User :: {}", user);
        ResponseEntity<Void> response = keycloakAdminClient.createUser(user);
        if (response.getStatusCode().is2xxSuccessful()) {
            String userId = extractUserIdFromLocation(response.getHeaders().getLocation());
            if (userId != null) {
                log.info("Created User ID = {}", userId);
                user.setId(userId);
                String groupId = userDto.group();
                if (!StringUtils.hasLength(groupId)) {
                    groupId = ownersGroupId;
                    log.info("Assigning default Property Owners group ID = {}", groupId);
                } else if ("agents".equalsIgnoreCase(groupId)) {
                    groupId = agentsGroupId;
                } else if ("owners".equalsIgnoreCase(groupId)) {
                    groupId = ownersGroupId;
                }
                try {
                    keycloakAdminClient.joinGroup(userId, groupId);
                } catch (Exception e) {
                    log.error("Failed to join group {} for user {}", groupId, userId, e);
                    throw new RuntimeException("User created but failed to join group", e);
                }
                return userMapper.toDtoWithGroup(user, groupId.equals(agentsGroupId) ? "agents" : "owners");
            } else {
                throw new RuntimeException("User created but Location header missing");
            }
        } else {
            throw new RuntimeException("Failed to create user: " + response.getStatusCode());
        }
    }

    private String extractUserIdFromLocation(URI location) {
        if (location == null) return null;
        String path = location.getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }

    @Override
    public UserDto getUserById(String userId) {
        try {
            return userMapper.toDto(keycloakAdminClient.getUserById(userId));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void updateUserStatus(String userId, boolean enabled) {
        User user = new User();
        user.setId(userId);
        user.setEnabled(enabled);
        try {
            keycloakAdminClient.updateUser(userId, user);
            log.info("Updated status for user {} to enabled={}", userId, enabled);
        } catch (Exception e) {
            log.error("Failed to update status for user {}", userId, e);
            throw new RuntimeException("Failed to update user status", e);
        }
    }

    @Override
    public void switchGroup(String userId, String targetGroup) {
        String targetGroupId;
        if ("agents".equalsIgnoreCase(targetGroup)) {
            targetGroupId = agentsGroupId;
        } else if ("owners".equalsIgnoreCase(targetGroup)) {
            targetGroupId = ownersGroupId;
        } else {
            throw new IllegalArgumentException("Invalid target group: " + targetGroup);
        }
        try {
            // 1. Get current groups
            List<Map<String, Object>> currentGroups = keycloakAdminClient.getUserGroups(userId);
            // 2. Identify and leave old groups (Owners or Agents)
            for (Map<String, Object> group : currentGroups) {
                String id = (String) group.get("id");
                if (id.equals(ownersGroupId) || id.equals(agentsGroupId)) {
                    if (!id.equals(targetGroupId)) {
                        log.info("Leaving group {} for user {}", id, userId);
                        keycloakAdminClient.leaveGroup(userId, id);
                    }
                }
            }
            // 3. Join new group
            log.info("Joining group {} for user {}", targetGroupId, userId);
            keycloakAdminClient.joinGroup(userId, targetGroupId);
        } catch (Exception e) {
            log.error("Failed to switch group for user {}", userId, e);
            throw new RuntimeException("Failed to switch group", e);
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
    public List<UserDto> getAllUsers() {
        log.info("UserServiceImpl :: getAllUsers using Feign Client");
        List<User> userList = keycloakAdminClient.getUsers("*");
        if (CollectionUtils.isEmpty(userList)) {
            return new ArrayList<>();
        }
        List<UserDto> uiUserList = new ArrayList<>();
        for (User user : userList) {
            try {
                String priorityGroup = null;
                try {
                    List<Map<String, Object>> groups = keycloakAdminClient.getUserGroups(user.getId());
                    priorityGroup = determinePriorityGroup(groups);
                } catch (Exception e) {
                    log.warn("Could not fetch groups for user {}: {}", user.getId(), e.getMessage());
                }
                uiUserList.add(userMapper.toDtoWithGroup(user, priorityGroup));
            } catch (Exception e) {
                log.error("Error mapping user {}", user.getId(), e);
            }
        }
        log.info("UserServiceImpl :: uiUserList size = {}", uiUserList.size());
        return uiUserList;
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
        if (isAgent) return "agents";
        if (isOwner) return "owners";
        return (String) groups.get(0).get("name");
    }

    @Override
    public List<UserDto> getAllMembersOfGroup(String groupId) {
        List<User> userList = keycloakGroupClient.getGroupMembers(groupId);
        if (!CollectionUtils.isEmpty(userList)) {
            return userList.stream().map(userMapper::toDto).collect(Collectors.toList());
        } else {
            return new ArrayList<>();
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