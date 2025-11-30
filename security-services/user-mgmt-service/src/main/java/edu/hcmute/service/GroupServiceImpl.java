package edu.hcmute.service;

import edu.hcmute.outbound.UserOutboundApi;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {
    private final UserOutboundApi userOutboundApi;

    @Override
    public boolean provisoningUser(String userId, String groupId, String accessToken) {
        return userOutboundApi.provisioningUser(userId, groupId, accessToken);
    }

    @Override
    public boolean deprovisoningUser(String userId, String groupId, String accessToken) {
        return userOutboundApi.deprovisioningUser(userId, groupId, accessToken);
    }
}