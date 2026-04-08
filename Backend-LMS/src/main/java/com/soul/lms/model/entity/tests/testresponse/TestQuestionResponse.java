package com.soul.lms.model.entity.tests.testresponse;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestQuestionResponse {

    @JsonProperty("questionId")
    private Long questionId;

    @JsonProperty("question")
    private String question;

    @JsonProperty("questionMark")
    private Integer questionMark;

    @JsonProperty("answers")
    private List<TestAnswerResponse> answers;

}
