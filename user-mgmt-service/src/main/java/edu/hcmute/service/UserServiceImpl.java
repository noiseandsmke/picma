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

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    private UserOutboundApi userOutboundApi;
    private UserMapper userMapper;

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
    public List<UserDto> getAllUsers(String accessToken) throws UserException {
        log.info("UserServiceImpl :: getAllUsers");
        List<User> userList = userOutboundApi.getAllUsers(accessToken);
        List<UserDto> uiUserList = new ArrayList<>();
        userList.stream().forEach((user) -> {
            uiUserList.add(userMapper.toDto(user));
        });
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
            throw new RuntimeException("No users found");
        }
    }
}