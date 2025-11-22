package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.exception.UserException;

import java.util.List;

public interface UserService {
    UserDto createUser(UserDto userDto, String accessToken);

    UserDto getUserById(String userId, String accessToken);

    boolean deleteUserById(String userId, String accessToken);

    List<UserDto> getAllUsers(String accessToken) throws UserException;

    List<UserDto> getAllMembersOfGroup(String groupId, String accessToken);
}