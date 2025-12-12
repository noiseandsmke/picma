package edu.hcmute.model;

public record NextAction(
        ActionType type,
        String reasoning,
        String query,
        String answer
) {
    public enum ActionType {
        SEARCH,
        MAPS,
        ANSWER
    }
}