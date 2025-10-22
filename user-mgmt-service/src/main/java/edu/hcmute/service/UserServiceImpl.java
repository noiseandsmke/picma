package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.exception.UserException;
import edu.hcmute.model.User;
import edu.hcmute.outbound.UserOutboundApi;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    private UserOutboundApi userOutboundApi;
    private ModelMapper modelMapper;

    public UserServiceImpl(UserOutboundApi userOutboundApi, ModelMapper modelMapper) {
        this.userOutboundApi = userOutboundApi;
        this.modelMapper = modelMapper;
    }

    @Override
    public UserDto createUser(UserDto userDto, String accessToken) {
        log.info("Request data = {}", userDto.toString());
        User user = modelMapper.map(userDto, User.class);
        log.info("User :: {}", user.toString());
        user = userOutboundApi.createUser(user, accessToken);
        userDto = modelMapper.map(user, UserDto.class);
        return userDto;
    }

    @Override
    public UserDto getUserById(String userId, String accessToken) {
        try {
            return modelMapper.map(userOutboundApi.getUserById(userId, accessToken), UserDto.class);
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
            uiUserList.add(modelMapper.map(user, UserDto.class));
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
                uiUserList.add(modelMapper.map(user, UserDto.class));
            });
            return uiUserList;
        } else {
            throw new RuntimeException("No users found");
        }
    }
}