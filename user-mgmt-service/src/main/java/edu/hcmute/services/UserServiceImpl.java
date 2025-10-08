package edu.hcmute.services;

import edu.hcmute.beans.UserBean;
import edu.hcmute.models.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    @Override
    public User createUser(UserBean userBean, String accessToken) {
        return null;
    }

    @Override
    public List<UserBean> getAllUsers(String accessToken) {
        return List.of();
    }

    @Override
    public List<UserBean> getAllMembersOfGroup(String groupId, String accessToken) {
        return List.of();
    }
}