package edu.hcmute.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@NoArgsConstructor
public class UserAccess implements Serializable {
    @Serial
    private static final long serialVersionUID = -5790951155079618416L;
    boolean manageGroupMembership = true;
    boolean view = true;
    boolean mapRoles = true;
    boolean impersonate = true;
    boolean manage = true;
}