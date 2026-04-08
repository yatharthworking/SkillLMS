package com.soul.lms.model.entity.studymaterial.quiz;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false, exclude = {"quizQuestionsDB", "quizAnswersDB"})
@Table(name = "FND_QUIZ_CORRECT_ANSWERS_MASTER")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuizCorrectAnswersDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "quiz_correct_answers_master_info")
    @SequenceGenerator(name = "quiz_correct_answers_master_info", sequenceName = "quiz_correct_answers_master_info", allocationSize = 1)
    @JsonProperty("quizCorrectAnswerId")
    @Column(name = "quiz_correct_answer_id")
    private Long quizCorrectAnswerId;

    @JoinColumn(name = "quiz_answer_id")
    @OneToOne
    private QuizAnswersDB quizAnswersDB;
    
    @JsonBackReference
    @OneToOne(mappedBy = "quizCorrectAnswersDB", cascade = CascadeType.ALL)
    private QuizQuestionsDB quizQuestionsDB;

}
