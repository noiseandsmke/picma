package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SessionData(
        @JsonProperty("token_response") TokenResponse tokenResponse,
        @JsonProperty("created_at") Long createdAt,
        @JsonProperty("expires_at") Long expiresAt
) {
    public static SessionData from(TokenResponse tokenResponse) {
        long now = System.currentTimeMillis();
        long expiresAt = now + (tokenResponse.expiresIn() * 1000);
        return new SessionData(tokenResponse, now, expiresAt);
    }

    public long getRemainingTimeSeconds() {
        long now = System.currentTimeMillis();
        long remaining = (expiresAt - now) / 1000;
        return Math.max(0, remaining);
    }

    public double getRemainingPercentage() {
        long now = System.currentTimeMillis();
        long totalTime = expiresAt - createdAt;
        long remainingTime = expiresAt - now;
        if (totalTime <= 0) return 0.0;
        return (double) remainingTime / totalTime;
    }

    public boolean shouldRefresh(double thresholdPercentage) {
        return getRemainingPercentage() < thresholdPercentage;
    }
}