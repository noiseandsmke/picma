package edu.hcmute.domain;

import lombok.Getter;

@Getter
public enum CoverageCode {
    FIRE(true),
    THEFT(false),
    NATURAL_DISASTER(false);
    private final boolean mandatory;

    CoverageCode(boolean mandatory) {
        this.mandatory = mandatory;
    }
}