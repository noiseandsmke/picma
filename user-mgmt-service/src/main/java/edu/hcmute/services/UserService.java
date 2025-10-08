package edu.hcmute.services;

import edu.hcmute.beans.UserBean;
import edu.hcmute.models.User;

import java.util.List;

public interface UserService {
    User createUser(UserBean userBean, String accessToken);

    List<UserBean> getAllUsers(String accessToken);

    List<UserBean> getAllMembersOfGroup(String groupId, String accessToken);
}