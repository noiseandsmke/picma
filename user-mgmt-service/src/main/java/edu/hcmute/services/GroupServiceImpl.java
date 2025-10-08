package edu.hcmute.services;

import edu.hcmute.outbound.UserOutboundApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GroupServiceImpl implements GroupService {
    private UserOutboundApi userOutboundApi;

    @Autowired
    public GroupServiceImpl(UserOutboundApi userOutboundApi) {
        this.userOutboundApi = userOutboundApi;
    }

    @Override
    public boolean provisoningUser(String userId, String groupId, String accessToken) {
        return userOutboundApi.provisioningUser(userId, groupId, accessToken);
    }

    @Override
    public boolean deprovisoningUser(String userId, String groupId, String accessToken) {
        return userOutboundApi.deprovisioningUser(userId, groupId, accessToken);
    }
}