package edu.hcmute.service;

import edu.hcmute.client.KeycloakAdminClient;
import edu.hcmute.client.KeycloakGroupClient;
import edu.hcmute.dto.User;
import edu.hcmute.dto.UserDto;
import edu.hcmute.mapper.UserMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserMgmtServiceImpl implements UserMgmtService {
    private static final String GROUP_AGENTS = "agents";

    private final UserMapper userMapper;
    private final KeycloakAdminClient keycloakAdminClient;
    private final KeycloakGroupClient keycloakGroupClient;

    @Value("${picma.iam.groups.owners}")
    private String ownersGroupId;
    @Value("${picma.iam.groups.agents}")
    private String agentsGroupId;

    @Override
    public List<UserDto> getAgentsByZipCode(String zipcode) {
        log.info("### Get Agents by ZipCode: {} ###", zipcode);
        if (!StringUtils.hasText(zipcode)) {
            log.warn("~~> zipcode is empty");
            return Collections.emptyList();
        }
        List<UserDto> allAgents = getAllAgents();
        List<UserDto> matchingAgents = allAgents.stream()
                .filter(agent -> zipcode.equals(agent.zipcode()))
                .toList();
        log.info("~~> Found {} agents for zipcode {}", matchingAgents.size(), zipcode);
        return matchingAgents;
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
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching user by id " + userId, e);
        }
    }

    @Override
    public UserDto updateUser(UserDto userDto) {
        if (userDto.id() != null) {
            UserDto existingUser = getUserById(userDto.id());
            boolean isAgent = GROUP_AGENTS.equals(existingUser.group());
            if (isAgent) {
                String oldZip = existingUser.zipcode();
                String newZip = userDto.zipcode();
                if (oldZip != null && !oldZip.equals(newZip)) {
                    throw new IllegalArgumentException("Agents cannot change their registered zipcode.");
                }
            }
        }
        User user = userMapper.toEntity(userDto);
        if (user.id() != null) {
            keycloakAdminClient.updateUser(user.id(), user);
        }
        return userDto;
    }

    @Override
    public List<UserDto> getAllUsers(String search) {
        log.info("### Get All Users with search: {} ###", search);
        if (!StringUtils.hasText(search)) {
            search = "*";
        }
        try {
            List<User> userList = keycloakAdminClient.getUsers(search);
            if (CollectionUtils.isEmpty(userList)) {
                return new ArrayList<>();
            }
            return userList.stream().map(userMapper::toDto).toList();
        } catch (FeignException.Unauthorized e) {
            log.error("~~> Unauthorized access to Keycloak Admin API", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access to Keycloak Admin API");
        } catch (Exception e) {
            log.error("~~> Error fetching users", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching users", e);
        }
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
            log.error("~~> Unauthorized access to Keycloak Group API", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access to Keycloak Group API");
        } catch (Exception e) {
            log.error("~~> Error fetching group members", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching group members", e);
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