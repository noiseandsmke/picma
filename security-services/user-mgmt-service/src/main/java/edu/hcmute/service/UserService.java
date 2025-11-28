package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.exception.UserException;

import java.util.List;

public interface UserService {
    UserDto createUser(UserDto userDto, String accessToken);

    UserDto registerUser(UserDto userDto);

    UserDto getUserById(String userId, String accessToken);

    boolean deleteUserById(String userId, String accessToken);

    UserDto updateUser(UserDto userDto, String accessToken);

    List<UserDto> getAllUsers(String accessToken) throws UserException;

    List<UserDto> getAllMembersOfGroup(String groupId, String accessToken);

    List<UserDto> getAllAgents(String accessToken);

    List<UserDto> getAllPropertyOwners(String accessToken);

    void forgotPassword(String email);

    void resetPassword(String token, String password);
}