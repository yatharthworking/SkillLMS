package com.soul.lms.model.entity.tests;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.checkerframework.checker.units.qual.C;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false, exclude = {"correctAnswerDB"})
@Data
@Entity
@Table(name = "FND_TEST_QUESTION_MASTER")
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestQuestionsDB implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_test_question_master")
    @SequenceGenerator(name = "seq_test_question_master", sequenceName = "seq_test_question_master", allocationSize = 1)
    @JsonProperty("questionId")
    @Column(name = "question_id")
    private Long questionId;

    @JsonProperty("question")
    @Column(name = "question", columnDefinition = "text")
    private String question;

    @JsonProperty("questionType")
    @Column(name = "question_type")
    private String questionType;

    @JsonProperty("questionMark")
    @Column(name = "question_mark")
    private Integer questionMark;

    @JsonProperty("correctAnswer")
    @JsonManagedReference
    @OneToOne(mappedBy = "testQuestionsDB", fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
    private CorrectAnswerDB correctAnswerDB;

    @JsonProperty("testAnswers")
    @JsonManagedReference
    @OneToMany(mappedBy = "testQuestionsDB", fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
    private List<TestAnswersDB> testAnswersDB = new ArrayList <>();

    @JsonBackReference
    @JoinColumn(name = "test_id")
    @ManyToOne(fetch = FetchType.EAGER)
    private TestDB testDB;
}
