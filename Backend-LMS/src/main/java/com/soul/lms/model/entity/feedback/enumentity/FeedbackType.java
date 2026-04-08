package com.soul.lms.model.entity.feedback.enumentity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum FeedbackType {

    COURSE_FEEDBACK, LIVE_TEST_FEEDBACK;

    @JsonCreator
    public static FeedbackType forValue(String value) {
        return FeedbackType.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}