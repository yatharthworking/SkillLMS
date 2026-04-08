package com.soul.lms.model.entity.tests.enumentity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TestPattern {

    SUBJECTIVE, OBJECTIVE;

    @JsonCreator
    public static TestPattern forValue(String value) { return TestPattern.valueOf(value.toUpperCase()); }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
