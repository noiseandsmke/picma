package edu.hcmute.model;

import java.util.List;

public record NextAction(
        ActionType type,
        String reasoning,
        String query,
        List<String> urls,
        String answer
) {
    public enum ActionType {
        SEARCH,
        MAPS,
        ANSWER
    }
}