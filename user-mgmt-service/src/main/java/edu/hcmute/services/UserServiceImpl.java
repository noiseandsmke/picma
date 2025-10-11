package edu.hcmute.services;

import edu.hcmute.beans.UserBean;
import edu.hcmute.models.User;
import edu.hcmute.outbound.UserOutboundApi;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    private UserOutboundApi userOutboundApi;
    private ModelMapper modelMapper;

    public UserServiceImpl(UserOutboundApi userOutboundApi, ModelMapper modelMapper) {
        this.userOutboundApi = userOutboundApi;
        this.modelMapper = modelMapper;
    }

    @Override
    public UserBean createUser(UserBean userBean, String accessToken) {
        log.info("Request data = {}", userBean.toString());
        User user = modelMapper.map(userBean, User.class);
        log.info("User :: {}", user.toString());
        user = userOutboundApi.createUser(user, accessToken);
        userBean = modelMapper.map(user, UserBean.class);
        return userBean;
    }

    @Override
    public UserBean getUserById(String userId, String accessToken) {
        try {
            return modelMapper.map(userOutboundApi.getUserById(userId, accessToken), UserBean.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean deleteUserById(String userId, String accessToken) {
        try {
            return userOutboundApi.deleteUserById(userId, accessToken);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<UserBean> getAllUsers(String accessToken) {
        List<User> userList = userOutboundApi.getAllUsers(accessToken);
        if (!CollectionUtils.isEmpty(userList)) {
            List<UserBean> uiUserList = new ArrayList<>();
            userList.stream().forEach((user) -> {
                uiUserList.add(modelMapper.map(user, UserBean.class));
            });
            return uiUserList;
        } else {
            throw new RuntimeException("No users found");
        }
    }

    @Override
    public List<UserBean> getAllMembersOfGroup(String groupId, String accessToken) {
        List<User> userList = userOutboundApi.getAllMembersOfGroup(groupId, accessToken);
        if (!CollectionUtils.isEmpty(userList)) {
            List<UserBean> uiUserList = new ArrayList<>();
            userList.stream().forEach((user) -> {
                uiUserList.add(modelMapper.map(user, UserBean.class));
            });
            return uiUserList;
        } else {
            throw new RuntimeException("No users found");
        }
    }
}