package edu.hcmute.entity;

import lombok.Data;

@Data
public class UserAccess {
    private boolean manageGroupMembership;
    private boolean view;
    private boolean mapRoles;
    private boolean impersonate;
    private boolean manage;
}