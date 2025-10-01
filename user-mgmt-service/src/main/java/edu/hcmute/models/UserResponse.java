package edu.hcmute.models;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonDeserialize
public class UserResponse {
    private List<User> userList;
}