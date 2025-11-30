package edu.hcmute.service;

import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.User;
import edu.hcmute.exception.UserException;
import edu.hcmute.mapper.UserMapper;
import edu.hcmute.outbound.KeycloakAdminClient;
import edu.hcmute.outbound.KeycloakGroupClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.URI;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @Mock
    private KeycloakAdminClient keycloakAdminClient;
    @Mock
    private KeycloakGroupClient keycloakGroupClient;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void createUser_success() {
        String ownersGroupId = "owners-group-id";
        ReflectionTestUtils.setField(userService, "ownersGroupId", ownersGroupId);
        UserDto inputDto = new UserDto(null, "u", "f", "l", "e@e.com", true, "12345", null);
        User entity = new User();
        UserDto resultDto = new UserDto("created-id", "u", "f", "l", "e@e.com", true, "12345", ownersGroupId);
        when(userMapper.toEntity(inputDto)).thenReturn(entity);
        ResponseEntity<Void> responseEntity = ResponseEntity.created(URI.create("http://localhost/users/created-id")).build();
        when(keycloakAdminClient.createUser(entity)).thenReturn(responseEntity);
        when(keycloakAdminClient.joinGroup(eq("created-id"), eq(ownersGroupId))).thenReturn(ResponseEntity.ok().build());
        when(userMapper.toDtoWithGroup(eq(entity), eq(ownersGroupId))).thenReturn(resultDto);
        UserDto result = userService.createUser(inputDto);
        assertNotNull(result);
        assertEquals("created-id", result.id());
        verify(keycloakAdminClient).createUser(entity);
        verify(keycloakAdminClient).joinGroup("created-id", ownersGroupId);
    }

    @Test
    void getUserById_success() {
        String id = "1";
        User entity = new User();
        UserDto resultDto = new UserDto(id, "u", "f", "l", "e@e.com", true, "12345", "owners");
        when(keycloakAdminClient.getUserById(id)).thenReturn(entity);
        when(userMapper.toDto(entity)).thenReturn(resultDto);
        UserDto result = userService.getUserById(id);
        assertNotNull(result);
        assertEquals(id, result.id());
    }

    @Test
    void deleteUserById_success() {
        String id = "1";
        when(keycloakAdminClient.deleteUser(id)).thenReturn(ResponseEntity.noContent().build());
        boolean result = userService.deleteUserById(id);
        assertTrue(result);
    }

    @Test
    void getAllUsers_success() throws UserException {
        User entity = new User();
        entity.setId("1");
        UserDto resultDto = new UserDto("1", "u", "f", "l", "e@e.com", true, "12345", "owners");
        when(keycloakAdminClient.getUsers("*")).thenReturn(Collections.singletonList(entity));
        when(keycloakAdminClient.getUserGroups("1")).thenReturn(Collections.emptyList());
        when(userMapper.toDtoWithGroup(eq(entity), any())).thenReturn(resultDto);
        List<UserDto> result = userService.getAllUsers();
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getAllMembersOfGroup_success() {
        String groupId = "g1";
        User entity = new User();
        UserDto resultDto = new UserDto("1", "u", "f", "l", "e@e.com", true, "12345", "owners");
        when(keycloakGroupClient.getGroupMembers(groupId)).thenReturn(Collections.singletonList(entity));
        when(userMapper.toDto(entity)).thenReturn(resultDto);
        List<UserDto> result = userService.getAllMembersOfGroup(groupId);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }
}