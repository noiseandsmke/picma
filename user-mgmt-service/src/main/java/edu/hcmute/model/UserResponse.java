package edu.hcmute.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class UserResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 4091928882314140428L;
    private List<User> userList;
}