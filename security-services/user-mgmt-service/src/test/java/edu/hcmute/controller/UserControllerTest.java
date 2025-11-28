package edu.hcmute.controller;

import edu.hcmute.dto.UserDto;
import edu.hcmute.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private HttpServletRequest request;

    private UserController userController;

    @BeforeEach
    void setUp() {
        userController = new UserController(userService, request);
    }

    @Test
    void getAllUsers_shouldReturnListOfUsers() throws Exception {
        String accessToken = "Bearer token";
        UserDto userDto = new UserDto("u", "f", "l", "e", "123", "g1", "1", true, true, false);
        List<UserDto> userList = Collections.singletonList(userDto);
        when(request.getHeader("Authorization")).thenReturn(accessToken);
        when(userService.getAllUsers("token")).thenReturn(userList);
        ResponseEntity<List<UserDto>> response = userController.getAllUsers("admin");
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userList, response.getBody());
        verify(userService).getAllUsers("token");
    }

    @Test
    void getAllPropertyOwners_shouldReturnListOfUsers() {
        String accessToken = "Bearer token";
        UserDto userDto = new UserDto("u", "f", "l", "e", "123", "g1", "1", true, true, false);
        List<UserDto> userList = Collections.singletonList(userDto);
        when(request.getHeader("Authorization")).thenReturn(accessToken);
        when(userService.getAllPropertyOwners("token")).thenReturn(userList);
        ResponseEntity<List<UserDto>> response = userController.getAllPropertyOwners();
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userList, response.getBody());
    }

    @Test
    void getAllAgents_shouldReturnListOfUsers() {
        String accessToken = "Bearer token";
        List<UserDto> userList = Collections.singletonList(new UserDto("u", "f", "l", "e", "123", "g1", "1", true, true, false));
        when(request.getHeader("Authorization")).thenReturn(accessToken);
        when(userService.getAllAgents("token")).thenReturn(userList);
        ResponseEntity<List<UserDto>> response = userController.getAllAgents();
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userList, response.getBody());
    }

    @Test
    void getAllBrokers_shouldReturnListOfUsers() {
        String accessToken = "Bearer token";
        List<UserDto> userList = Collections.singletonList(new UserDto("u", "f", "l", "e", "123", "g1", "1", true, true, false));
        when(request.getHeader("Authorization")).thenReturn(accessToken);
        when(userService.getAllBrokers("token")).thenReturn(userList);
        ResponseEntity<List<UserDto>> response = userController.getAllBrokers();
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userList, response.getBody());
    }

    @Test
    void createUser_shouldReturnCreatedUser() {
        String accessToken = "Bearer token";
        UserDto inputDto = new UserDto("u", "f", "l", "e", "123", "g1", null, true, true, false);
        UserDto returnedDto = new UserDto("u", "f", "l", "e", "123", "g1", "1", true, true, false);
        when(request.getHeader("Authorization")).thenReturn(accessToken);
        when(userService.createUser(any(UserDto.class), eq("token"))).thenReturn(returnedDto);
        ResponseEntity<UserDto> response = userController.createUser(inputDto);
        assertNotNull(response);
        assertEquals(201, response.getStatusCode().value());
        assertEquals(returnedDto, response.getBody());
    }

    @Test
    void getUserById_shouldReturnUser() {
        String accessToken = "Bearer token";
        String userId = "1";
        UserDto userDto = new UserDto("u", "f", "l", "e", "123", "g1", userId, true, true, false);
        when(request.getHeader("Authorization")).thenReturn(accessToken);
        when(userService.getUserById(userId, "token")).thenReturn(userDto);
        ResponseEntity<UserDto> response = userController.getUserById(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userDto, response.getBody());
    }

    @Test
    void deleteUserById_shouldReturnMessage() {
        String accessToken = "Bearer token";
        String userId = "1";
        when(request.getHeader("Authorization")).thenReturn(accessToken);
        when(userService.deleteUserById(userId, "token")).thenReturn(true);
        ResponseEntity<?> response = userController.deleteUserById(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
    }
}