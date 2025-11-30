package edu.hcmute.controller;

import edu.hcmute.dto.UserDto;
import edu.hcmute.service.UserService;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    private UserController userController;

    @BeforeEach
    void setUp() {
        userController = new UserController(userService);
    }

    @Test
    void getAllUsers_shouldReturnListOfUsers() throws Exception {
        // id, username, firstName, lastName, email, emailVerified, zipcode, group
        UserDto userDto = new UserDto("1", "u", "f", "l", "e@e.com", true, "12345", "owners");
        List<UserDto> userList = Collections.singletonList(userDto);
        when(userService.getAllUsers()).thenReturn(userList);
        ResponseEntity<List<UserDto>> response = userController.getAllUsers("admin");
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userList, response.getBody());
        verify(userService).getAllUsers();
    }

    @Test
    void getAllPropertyOwners_shouldReturnListOfUsers() {
        UserDto userDto = new UserDto("1", "u", "f", "l", "e@e.com", true, "12345", "owners");
        List<UserDto> userList = Collections.singletonList(userDto);
        when(userService.getAllPropertyOwners()).thenReturn(userList);
        ResponseEntity<List<UserDto>> response = userController.getAllPropertyOwners();
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userList, response.getBody());
    }

    @Test
    void getAllAgents_shouldReturnListOfUsers() {
        List<UserDto> userList = Collections.singletonList(new UserDto("1", "u", "f", "l", "e@e.com", true, "12345", "agents"));
        when(userService.getAllAgents()).thenReturn(userList);
        ResponseEntity<List<UserDto>> response = userController.getAllAgents();
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userList, response.getBody());
    }

    @Test
    void createUser_shouldReturnCreatedUser() {
        UserDto inputDto = new UserDto(null, "u", "f", "l", "e@e.com", true, "12345", "owners");
        UserDto returnedDto = new UserDto("1", "u", "f", "l", "e@e.com", true, "12345", "owners");
        when(userService.createUser(any(UserDto.class))).thenReturn(returnedDto);
        ResponseEntity<UserDto> response = userController.createUser(inputDto);
        assertNotNull(response);
        assertEquals(201, response.getStatusCode().value());
        assertEquals(returnedDto, response.getBody());
    }

    @Test
    void getUserById_shouldReturnUser() {
        String userId = "1";
        UserDto userDto = new UserDto(userId, "u", "f", "l", "e@e.com", true, "12345", "owners");
        when(userService.getUserById(userId)).thenReturn(userDto);
        ResponseEntity<UserDto> response = userController.getUserById(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(userDto, response.getBody());
    }

    @Test
    void deleteUserById_shouldReturnMessage() {
        String userId = "1";
        when(userService.deleteUserById(userId)).thenReturn(true);
        ResponseEntity<?> response = userController.deleteUserById(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
    }
}