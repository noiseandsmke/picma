package edu.hcmute.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserAccess {
    boolean manageGroupMembership = true;
    boolean view = true;
    boolean mapRoles = true;
    boolean impersonate = true;
    boolean manage = true;
}