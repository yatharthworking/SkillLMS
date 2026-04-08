package com.soul.lms.model.entity.tests.testresponse;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestAnswerResponse {

    @JsonProperty("answerId")
    private Long answerId;

    @Lob
    @JsonProperty("answer")
    private String answer;

    @JsonProperty("isCorrect")
    private boolean isCorrect;

    @JsonProperty("isSubmitted")
    private boolean isSubmitted;

}
