package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.User;
import edu.hcmute.exception.UserException;
import edu.hcmute.mapper.UserMapper;
import edu.hcmute.outbound.UserOutboundApi;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @Mock
    private UserOutboundApi userOutboundApi;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void createUser_success() {
        UserDto inputDto = new UserDto("u", "f", "l", "e", "123", "g1", null, true, true, false);
        User entity = new User();
        UserDto resultDto = new UserDto("u", "f", "l", "e", "123", "g1", "1", true, true, false);
        when(userMapper.toEntity(inputDto)).thenReturn(entity);
        when(userOutboundApi.createUser(entity, "token")).thenReturn(entity);
        when(userMapper.toDto(entity)).thenReturn(resultDto);
        UserDto result = userService.createUser(inputDto, "token");
        assertNotNull(result);
        assertEquals("1", result.id());
        verify(userOutboundApi).createUser(entity, "token");
    }

    @Test
    void getUserById_success() {
        String id = "1";
        User entity = new User();
        UserDto resultDto = new UserDto("u", "f", "l", "e", "123", "g1", id, true, true, false);
        when(userOutboundApi.getUserById(id, "token")).thenReturn(entity);
        when(userMapper.toDto(entity)).thenReturn(resultDto);
        UserDto result = userService.getUserById(id, "token");
        assertNotNull(result);
        assertEquals(id, result.id());
    }

    @Test
    void getUserById_error() {
        String id = "1";
        when(userOutboundApi.getUserById(id, "token")).thenThrow(new RuntimeException("API error"));
        assertThrows(RuntimeException.class, () -> userService.getUserById(id, "token"));
    }

    @Test
    void deleteUserById_success() {
        String id = "1";
        when(userOutboundApi.deleteUserById(id, "token")).thenReturn(true);
        boolean result = userService.deleteUserById(id, "token");
        assertTrue(result);
    }

    @Test
    void deleteUserById_error() {
        String id = "1";
        when(userOutboundApi.deleteUserById(id, "token")).thenThrow(new RuntimeException("API error"));
        assertThrows(RuntimeException.class, () -> userService.deleteUserById(id, "token"));
    }

    @Test
    void getAllUsers_success() throws UserException {
        User entity = new User();
        UserDto resultDto = new UserDto("u", "f", "l", "e", "123", "g1", "1", true, true, false);
        when(userOutboundApi.getAllUsers("token")).thenReturn(Collections.singletonList(entity));
        when(userMapper.toDto(entity)).thenReturn(resultDto);
        List<UserDto> result = userService.getAllUsers("token");
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getAllMembersOfGroup_success() {
        String groupId = "g1";
        User entity = new User();
        UserDto resultDto = new UserDto("u", "f", "l", "e", "123", "g1", "1", true, true, false);
        when(userOutboundApi.getAllMembersOfGroup(groupId, "token")).thenReturn(Collections.singletonList(entity));
        when(userMapper.toDto(entity)).thenReturn(resultDto);
        List<UserDto> result = userService.getAllMembersOfGroup(groupId, "token");
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getAllMembersOfGroup_empty() {
        String groupId = "g1";
        when(userOutboundApi.getAllMembersOfGroup(groupId, "token")).thenReturn(Collections.emptyList());
        List<UserDto> result = userService.getAllMembersOfGroup(groupId, "token");
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}