package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.User;
import edu.hcmute.exception.UserException;
import edu.hcmute.mapper.UserMapper;
import edu.hcmute.outbound.UserOutboundApi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserOutboundApi userOutboundApi;
    private final UserMapper userMapper;

    public UserServiceImpl(UserOutboundApi userOutboundApi, UserMapper userMapper) {
        this.userOutboundApi = userOutboundApi;
        this.userMapper = userMapper;
    }

    @Override
    public UserDto createUser(UserDto userDto, String accessToken) {
        log.info("Request data = {}", userDto.toString());
        User user = userMapper.toEntity(userDto);
        log.info("User :: {}", user.toString());
        user = userOutboundApi.createUser(user, accessToken);
        userDto = userMapper.toDto(user);
        return userDto;
    }

    @Override
    public UserDto registerUser(UserDto userDto) {
        log.info("Register User :: {}", userDto);
        String accessToken = userOutboundApi.getAdminToken();
        User user = userMapper.toEntity(userDto);
        user = userOutboundApi.createUser(user, accessToken);
        return userMapper.toDto(user);
    }

    @Override
    public UserDto getUserById(String userId, String accessToken) {
        try {
            return userMapper.toDto(userOutboundApi.getUserById(userId, accessToken));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean deleteUserById(String userId, String accessToken) {
        try {
            return userOutboundApi.deleteUserById(userId, accessToken);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public UserDto updateUser(UserDto userDto, String accessToken) {
        User user = userMapper.toEntity(userDto);
        userOutboundApi.updateProfile(user, accessToken);
        return userDto;
    }

    @Override
    public List<UserDto> getAllUsers(String accessToken) throws UserException {
        log.info("UserServiceImpl :: getAllUsers");
        List<User> userList = userOutboundApi.getAllUsers(accessToken);
        List<UserDto> uiUserList = new ArrayList<>();
        if (userList != null) {
            userList.stream().forEach((user) -> {
                uiUserList.add(userMapper.toDto(user));
            });
        }
        log.info("UserServiceImpl :: uiUserList size = {}", uiUserList.size());
        return uiUserList;
    }

    @Override
    public List<UserDto> getAllMembersOfGroup(String groupId, String accessToken) {
        List<User> userList = userOutboundApi.getAllMembersOfGroup(groupId, accessToken);
        if (!CollectionUtils.isEmpty(userList)) {
            List<UserDto> uiUserList = new ArrayList<>();
            userList.stream().forEach((user) -> {
                uiUserList.add(userMapper.toDto(user));
            });
            return uiUserList;
        } else {
            return new ArrayList<>();
        }
    }

    @Override
    public List<UserDto> getAllAgents(String accessToken) {
        List<User> users = userOutboundApi.getAllAgents(accessToken);
        return mapToDtoList(users);
    }

    @Override
    public List<UserDto> getAllPropertyOwners(String accessToken) {
        List<User> users = userOutboundApi.getAllPropertyOwners(accessToken);
        return mapToDtoList(users);
    }

    @Override
    public void forgotPassword(String email) {
        // TODO: Call Keycloak execute-actions-email
        log.info("Forgot password for {}", email);
    }

    @Override
    public void resetPassword(String token, String password) {
        log.info("Reset password with token");
    }

    private List<UserDto> mapToDtoList(List<User> users) {
        if (CollectionUtils.isEmpty(users)) {
            return new ArrayList<>();
        }
        return users.stream().map(userMapper::toDto).collect(Collectors.toList());
    }
}