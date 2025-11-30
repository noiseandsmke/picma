package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.User;
import edu.hcmute.mapper.UserMapper;
import edu.hcmute.outbound.KeycloakAdminClient;
import edu.hcmute.outbound.KeycloakGroupClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;
    private final KeycloakAdminClient keycloakAdminClient;
    private final KeycloakGroupClient keycloakGroupClient;

    @Value("${picma.iam.groups.owners}")
    private String ownersGroupId;

    @Value("${picma.iam.groups.agents}")
    private String agentsGroupId;

    public UserServiceImpl(UserMapper userMapper, KeycloakAdminClient keycloakAdminClient, KeycloakGroupClient keycloakGroupClient) {
        this.userMapper = userMapper;
        this.keycloakAdminClient = keycloakAdminClient;
        this.keycloakGroupClient = keycloakGroupClient;
    }

    @Override
    public UserDto createUser(UserDto userDto, String accessToken) {
        log.info("Request data = {}", userDto.toString());
        User user = userMapper.toEntity(userDto);
        log.info("Creating User :: {}", user.toString());
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
                } else {
                    log.info("Assigning requested group ID = {}", groupId);
                }
                try {
                    keycloakAdminClient.joinGroup(userId, groupId);
                } catch (Exception e) {
                    log.error("Failed to join group {} for user {}", groupId, userId, e);
                    throw new RuntimeException("User created but failed to join group", e);
                }
                return userMapper.toDtoWithGroup(user, groupId);
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
    public UserDto registerUser(UserDto userDto) {
        return createUser(userDto, null);
    }

    @Override
    public UserDto getUserById(String userId, String accessToken) {
        try {
            return userMapper.toDto(keycloakAdminClient.getUserById(userId));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean deleteUserById(String userId, String accessToken) {
        try {
            keycloakAdminClient.deleteUser(userId);
            return true;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public UserDto updateUser(UserDto userDto, String accessToken) {
        User user = userMapper.toEntity(userDto);
        if (user.getId() != null) {
            keycloakAdminClient.updateUser(user.getId(), user);
        }
        return userDto;
    }

    @Override
    public List<UserDto> getAllUsers(String accessToken) {
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
    public List<UserDto> getAllMembersOfGroup(String groupId, String accessToken) {
        List<User> userList = keycloakGroupClient.getGroupMembers(groupId);
        if (!CollectionUtils.isEmpty(userList)) {
            return userList.stream().map(userMapper::toDto).collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    @Override
    public List<UserDto> getAllAgents(String accessToken) {
        return getAllMembersOfGroup(agentsGroupId, accessToken);
    }

    @Override
    public List<UserDto> getAllPropertyOwners(String accessToken) {
        return getAllMembersOfGroup(ownersGroupId, accessToken);
    }

    @Override
    public void forgotPassword(String email) {
        log.info("Forgot password for {}", email);
    }

    @Override
    public void resetPassword(String token, String password) {
        log.info("Reset password with token");
    }
}