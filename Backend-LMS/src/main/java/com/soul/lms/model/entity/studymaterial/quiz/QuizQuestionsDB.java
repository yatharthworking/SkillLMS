package com.soul.lms.model.entity.studymaterial.quiz;

import com.fasterxml.jackson.annotation.*;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false, exclude = {"quizCorrectAnswersDB"})
@Table(name = "FND_QUIZ_QUESTIONS_MASTER")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuizQuestionsDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "quiz_questions_master_info")
    @SequenceGenerator(name = "quiz_questions_master_info", sequenceName = "quiz_questions_master_info", allocationSize = 1)
    @JsonProperty("quizQuestionId")
    @Column(name = "quiz_question_id")
    private Long quizQuestionId;


    @JsonProperty("questionNo")
    @Column(name = "question_no")
    private Integer questionNo;

    @NotBlank(message = "question Text cannot be blank")
    @JsonProperty("questionText")
    @Column(name = "question_text", columnDefinition = "text")
    private String questionText;

    @JsonProperty("questionType")
    @Column(name = "TEST_TYPE")
    private String questionType;

    @JsonBackReference
    @JoinColumn(name = "quiz_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private QuizDB quizDB;

    @JsonProperty("quizAnswers")
    @JsonManagedReference
    @OneToMany(mappedBy = "quizQuestionsDB", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAnswersDB> quizAnswersDBList = new ArrayList<>();


    @JsonIgnore
    @JsonManagedReference
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "quiz_correct_answer_id")
    private QuizCorrectAnswersDB quizCorrectAnswersDB;
}
