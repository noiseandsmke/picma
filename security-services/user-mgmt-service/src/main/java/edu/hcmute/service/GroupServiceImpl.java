package edu.hcmute.service;

import edu.hcmute.outbound.KeycloakAdminClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {
    private final KeycloakAdminClient keycloakAdminClient;

    @Override
    public boolean provisoningUser(String userId, String groupId, String accessToken) {
        try {
            keycloakAdminClient.joinGroup(userId, groupId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean deprovisoningUser(String userId, String groupId, String accessToken) {
        try {
            keycloakAdminClient.leaveGroup(userId, groupId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}