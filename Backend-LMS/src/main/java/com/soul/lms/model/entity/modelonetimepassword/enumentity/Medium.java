package com.soul.lms.model.entity.modelonetimepassword.enumentity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Medium {
    EMAIL, MOBILE;

    @JsonCreator
    public static Medium forValue(String value) {
        return Medium.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
