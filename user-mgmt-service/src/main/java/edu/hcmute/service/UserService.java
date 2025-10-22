package edu.hcmute.service;

import edu.hcmute.bean.UserBean;
import edu.hcmute.exception.UserException;

import java.util.List;

public interface UserService {
    UserBean createUser(UserBean userBean, String accessToken);

    UserBean getUserById(String userId, String accessToken);

    boolean deleteUserById(String userId, String accessToken);

    List<UserBean> getAllUsers(String accessToken) throws UserException;

    List<UserBean> getAllMembersOfGroup(String groupId, String accessToken);
}