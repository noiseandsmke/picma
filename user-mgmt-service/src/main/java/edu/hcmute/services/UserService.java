package edu.hcmute.services;

import edu.hcmute.beans.UserBean;

import java.util.List;

public interface UserService {
    UserBean createUser(UserBean userBean, String accessToken);

    UserBean getUserById(String userId, String accessToken);

    boolean deleteUserById(String userId, String accessToken);

    List<UserBean> getAllUsers(String accessToken);

    List<UserBean> getAllMembersOfGroup(String groupId, String accessToken);
}