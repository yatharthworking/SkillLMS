package com.soul.lms.model.entity.tests.enumentity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TestType {

    LIVE_TEST, MOCK_TEST, ASSIGNMENT, QUIZ, EXAM;

    @JsonCreator
    public static TestType forValue(String value) {
        return TestType.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}