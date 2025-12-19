package edu.hcmute.service;

import edu.hcmute.dto.UserDto;

import java.util.List;

public interface UserMgmtService {
    UserDto getUserById(String userId);

    UserDto updateUser(UserDto userDto);

    List<UserDto> getAllUsers(String search);

    List<UserDto> getAllMembersOfGroup(String groupId);

    List<UserDto> getAllAgents();

    List<UserDto> getAgentsByZipCode(String zipcode);

    List<UserDto> getAllPropertyOwners();
}