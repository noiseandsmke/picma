package edu.hcmute.models;

import lombok.Builder;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
@Builder
public class UserAccess implements Serializable {
    @Serial
    private static final long serialVersionUID = -5790951155079618416L;
    @Builder.Default
    boolean manageGroupMembership = true;
    @Builder.Default
    boolean view = true;
    @Builder.Default
    boolean mapRoles = true;
    @Builder.Default
    boolean impersonate = true;
    @Builder.Default
    boolean manage = true;
}