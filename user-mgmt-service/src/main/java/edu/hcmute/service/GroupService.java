package edu.hcmute.service;

public interface GroupService {
    boolean provisoningUser(String userId, String groupId, String accessToken);

    boolean deprovisoningUser(String userId, String groupId, String accessToken);
}