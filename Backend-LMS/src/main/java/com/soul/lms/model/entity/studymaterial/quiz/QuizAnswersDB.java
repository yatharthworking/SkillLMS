package com.soul.lms.model.entity.studymaterial.quiz;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Table(name = "FND_QUIZ_ANSWERS_MASTER")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuizAnswersDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "quiz_answers_master_info")
    @SequenceGenerator(name = "quiz_answers_master_info", sequenceName = "quiz_answers_master_info", allocationSize = 1)
    @JsonProperty("quizAnswerId")
    @Column(name = "quiz_answer_id")
    private Long quizAnswerId;

    @JsonProperty("answerOption")
    @Lob
    @Column(name = "answer_option")
    private String answerOption;

    //set this variable to true for the answers Id present in QuizCorrectAnswersDB.
    @Transient
    @JsonProperty("isCorrect")
    private Boolean isCorrect;

    @JsonBackReference
    @JoinColumn(name = "quiz_question_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private QuizQuestionsDB quizQuestionsDB;
}
