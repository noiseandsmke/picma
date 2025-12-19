package edu.hcmute.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserAccess(
        boolean manageGroupMembership,
        boolean view,
        boolean mapRoles,
        boolean impersonate,
        boolean manage
) {
}