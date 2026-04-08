package com.soul.lms.model.entity.tests.testresponse;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestResponse {

    @JsonProperty("testId")
    private Long testId;

    @JsonProperty("testName")
    private String testName;

    @JsonProperty("questions")
    private List<TestQuestionResponse> questions;

}
