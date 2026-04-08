package com.soul.lms.model.entity.studymaterial.quiz;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddQuizEntity {

    @JsonProperty("chapterId")
    private Long chapterId;

    @JsonProperty("quiz")
    private QuizDB quiz;
}
