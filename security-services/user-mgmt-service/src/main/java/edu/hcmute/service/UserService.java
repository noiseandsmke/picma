package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.exception.UserException;

import java.util.List;

public interface UserService {
    UserDto createUser(UserDto userDto);

    UserDto getUserById(String userId);

    void updateUserStatus(String userId);

    void switchGroup(String userId);

    UserDto updateUser(UserDto userDto);

    List<UserDto> getAllUsers() throws UserException;

    List<UserDto> getAllMembersOfGroup(String groupId);

    List<UserDto> getAllAgents();

    List<UserDto> getAllPropertyOwners();
}